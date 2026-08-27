const prisma = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const jwt = require('jsonwebtoken');

async function registerAdmin(req, res) {
  try {
    const { tuitionClassName, adminName, email, password } = req.body;

    if (!tuitionClassName || !adminName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    debugger;
    const tuitionClass = await prisma.tuitionClass.create({
      data: { name: tuitionClassName },
    });

    const passwordHash = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        name: adminName,
        email,
        passwordHash,
        tuitionClassId: tuitionClass.id,
      },
    });

    const payload = { adminId: admin.id, tuitionClassId: tuitionClass.id, role: admin.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      message: 'Tuition class registered successfully',
      admin: { id: admin.id, name: admin.name, email: admin.email },
      tuitionClass: { id: tuitionClass.id, name: tuitionClass.name },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during registration' });
  }
}
async function loginAdmin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await comparePassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = { adminId: admin.id, tuitionClassId: admin.tuitionClassId, role: admin.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      message: 'Login successful',
      admin: { id: admin.id, name: admin.name, email: admin.email },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
}

const { generateAccessToken: genAccess, generateRefreshToken: genRefresh } = require('../utils/token');

async function loginStudent(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const student = await prisma.student.findUnique({ where: { username } });
    if (!student) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await comparePassword(password, student.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = { studentId: student.id, tuitionClassId: student.tuitionClassId, type: 'student' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      message: 'Login successful',
      student: { id: student.id, fullName: student.fullName, studentNumber: student.studentNumber },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong during login' });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const payload = decoded.type === 'student'
      ? { studentId: decoded.studentId, tuitionClassId: decoded.tuitionClassId, type: 'student' }
      : { adminId: decoded.adminId, tuitionClassId: decoded.tuitionClassId, role: decoded.role };

    const newAccessToken = generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while refreshing the token' });
  }
}

module.exports = { registerAdmin, loginAdmin, loginStudent, refreshToken };