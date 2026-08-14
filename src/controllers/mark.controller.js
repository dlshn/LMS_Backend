const prisma = require('../utils/prisma');

async function getMarksEntryForm(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { examId } = req.params;

    const exam = await prisma.exam.findFirst({ where: { id: examId, tuitionClassId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found in your tuition class' });
    }

    const students = await prisma.student.findMany({
      where: { tuitionClassId },
      select: { id: true, studentNumber: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });

    const existingMarks = await prisma.mark.findMany({
      where: { examId },
      select: { studentId: true, marksObtained: true },
    });
    const marksByStudent = Object.fromEntries(existingMarks.map((m) => [m.studentId, m.marksObtained]));

    const form = students.map((s) => ({
      studentId: s.id,
      studentNumber: s.studentNumber,
      fullName: s.fullName,
      marksObtained: marksByStudent[s.id] ?? null,
    }));

    res.json({
      exam: { id: exam.id, title: exam.title, maxMarks: exam.maxMarks, status: exam.status },
      students: form,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while building the marks form' });
  }
}

async function submitBulkMarks(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { examId } = req.params;
    const { marks } = req.body; // expected: [{ studentId, marksObtained }, ...]

    const exam = await prisma.exam.findFirst({ where: { id: examId, tuitionClassId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found in your tuition class' });
    }

    if (!Array.isArray(marks) || marks.length === 0) {
      return res.status(400).json({ error: 'marks must be a non-empty array' });
    }

    const studentIds = marks.map((m) => m.studentId);
    const validStudents = await prisma.student.findMany({
      where: { id: { in: studentIds }, tuitionClassId },
      select: { id: true },
    });
    const validIds = new Set(validStudents.map((s) => s.id));

    for (const m of marks) {
      if (!validIds.has(m.studentId)) {
        return res.status(400).json({ error: `Student ${m.studentId} does not belong to your tuition class` });
      }
      const value = Number(m.marksObtained);
      if (m.marksObtained === undefined || m.marksObtained === null || Number.isNaN(value) || value < 0 || value > exam.maxMarks) {
        return res.status(400).json({ error: `Invalid marksObtained for student ${m.studentId}` });
      }
    }

    const saved = await prisma.$transaction(
      marks.map((m) =>
        prisma.mark.upsert({
          where: { examId_studentId: { examId, studentId: m.studentId } },
          update: { marksObtained: Number(m.marksObtained) },
          create: { examId, studentId: m.studentId, marksObtained: Number(m.marksObtained) },
        })
      )
    );

    res.status(201).json({ message: `${saved.length} marks saved`, count: saved.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while saving marks' });
  }
}

async function getMyResults(req, res) {
  try {
    const studentId = req.student.studentId;

    const marks = await prisma.mark.findMany({
      where: { studentId, exam: { status: 'PUBLISHED' } },
      include: { exam: { select: { id: true, title: true, subject: true, examDate: true, maxMarks: true } } },
      orderBy: { exam: { examDate: 'desc' } },
    });

    res.json({
      count: marks.length,
      results: marks.map((m) => ({
        exam: m.exam,
        marksObtained: m.marksObtained,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching your results' });
  }
}

module.exports = { getMarksEntryForm, submitBulkMarks, getMyResults };