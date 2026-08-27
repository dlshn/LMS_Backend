const prisma = require('../utils/prisma');

async function createExam(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { title, subject, examDate, description, maxMarks } = req.body;

    if (!title || !subject || !examDate || !maxMarks) {
      return res.status(400).json({ error: 'title, subject, examDate and maxMarks are required' });
    }

    const exam = await prisma.exam.create({
      data: {
        tuitionClassId,
        title,
        subject,
        examDate: new Date(examDate),
        description,
        maxMarks: Number(maxMarks),
      },
    });

    res.status(201).json({ message: 'Exam created', exam });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating the exam' });
  }
}

async function getAllExams(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;

    const exams = await prisma.exam.findMany({
      where: { tuitionClassId },
      orderBy: { examDate: 'desc' },
    });

    res.json({ count: exams.length, exams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching exams' });
  }
}

async function updateExam(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { id } = req.params;
    const { title, subject, examDate, description, maxMarks } = req.body;

    const exam = await prisma.exam.findFirst({ where: { id, tuitionClassId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found in your tuition class' });
    }

    if (exam.status === 'PUBLISHED') {
      return res.status(400).json({ error: 'Cannot edit a published exam. Unpublish it first if changes are needed.' });
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        title,
        subject,
        examDate: examDate ? new Date(examDate) : undefined,
        description,
        maxMarks: maxMarks ? Number(maxMarks) : undefined,
      },
    });

    res.json({ message: 'Exam updated', exam: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while updating the exam' });
  }
}

async function publishExam(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { id } = req.params;

    const exam = await prisma.exam.findFirst({ where: { id, tuitionClassId } });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found in your tuition class' });
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    res.json({ message: 'Exam published', exam: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while publishing the exam' });
  }
}

module.exports = { createExam, getAllExams, updateExam, publishExam };