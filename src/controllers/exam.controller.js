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

module.exports = { createExam, getAllExams };