const prisma = require('../utils/prisma');

async function markAttendance(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { studentId, date, status } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({ error: 'studentId, date and status are required' });
    }

    if (!['PRESENT', 'ABSENT'].includes(status)) {
      return res.status(400).json({ error: 'status must be PRESENT or ABSENT' });
    }

    const student = await prisma.student.findFirst({ where: { id: studentId, tuitionClassId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found in your tuition class' });
    }

    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId, date: new Date(date) } },
      update: { status },
      create: {
        tuitionClassId,
        studentId,
        date: new Date(date),
        status,
      },
    });

    res.status(201).json({ message: 'Attendance recorded', attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while marking attendance' });
  }
}

async function getStudentAttendance(req, res) {
  try {
    const tuitionClassId = req.admin.tuitionClassId;
    const { studentId } = req.params;

    const student = await prisma.student.findFirst({ where: { id: studentId, tuitionClassId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found in your tuition class' });
    }

    const records = await prisma.attendance.findMany({
      where: { studentId, tuitionClassId },
      orderBy: { date: 'desc' },
      select: { id: true, date: true, status: true },
    });

    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const totalCount = records.length;
    const percentage = totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100);

    res.json({
      student: { id: student.id, fullName: student.fullName },
      summary: { totalDays: totalCount, presentDays: presentCount, percentage },
      records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching attendance' });
  }
}

module.exports = { markAttendance, getStudentAttendance };