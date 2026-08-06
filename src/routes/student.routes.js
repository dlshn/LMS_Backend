const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { registerStudent, getAllStudents, getStudentById } = require('../controllers/student.controller');

router.post('/', requireAuth, registerStudent);
router.get('/', requireAuth, getAllStudents);
router.get('/:id', requireAuth, getStudentById);

module.exports = router;