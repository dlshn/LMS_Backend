const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { markAttendance, getStudentAttendance } = require('../controllers/attendance.controller');

router.post('/', requireAuth, markAttendance);
router.get('/student/:studentId', requireAuth, getStudentAttendance);

module.exports = router;