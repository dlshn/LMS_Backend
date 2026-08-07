const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { createExam, getAllExams } = require('../controllers/exam.controller');

router.post('/', requireAuth, createExam);
router.get('/', requireAuth, getAllExams);

module.exports = router;