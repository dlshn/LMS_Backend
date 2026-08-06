const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { registerStudent } = require('../controllers/student.controller');

router.post('/', requireAuth, registerStudent);

module.exports = router;