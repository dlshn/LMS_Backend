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

module.exports = { registerStudent };