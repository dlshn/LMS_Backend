const prisma = require('../utils/prisma');
const { hashPassword } = require('../utils/hash');

async function registerStudent(req, res) {
  try {
    const { studentNumber, fullName, username, password, school, phone, parentPhone } = req.body;

    if (!studentNumber || !fullName || !username || !password) {
      return res.status(400).json({ error: 'studentNumber, fullName, username and password are required' });
    }

    const tuitionClassId = req.admin.tuitionClassId;

    const existingUsername = await prisma.student.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const existingNumber = await prisma.student.findUnique({
      where: { tuitionClassId_studentNumber: { tuitionClassId, studentNumber } },
    });
    if (existingNumber) {
      return res.status(409).json({ error: 'Student number already used in this tuition class' });
    }

    const passwordHash = await hashPassword(password);

    const student = await prisma.student.create({
      data: {
        tuitionClassId,
        studentNumber,
        fullName,
        username,
        passwordHash,
        school,
        phone,
        parentPhone,
      },
    });

    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        fullName: student.fullName,
        username: student.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while registering the student' });
  }
}

async function getAllStudents(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;

    const students = await prisma.student.findMany({
      where: { tuitionClassId },
      select: {
        id: true,
        studentNumber: true,
        fullName: true,
        username: true,
        school: true,
        phone: true,
        parentPhone: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });

    res.json({ count: students.length, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching students' });
  }
}

async function getStudentById(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: { id, tuitionClassId },
      select: {
        id: true,
        studentNumber: true,
        fullName: true,
        username: true,
        school: true,
        phone: true,
        parentPhone: true,
        createdAt: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching the student' });
  }
}

module.exports = { registerStudent, getAllStudents, getStudentById };