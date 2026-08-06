const prisma = require('../utils/prisma');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

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

module.exports = { registerAdmin };