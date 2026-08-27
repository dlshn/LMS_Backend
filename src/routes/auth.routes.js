const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, loginStudent, refreshToken } = require('../controllers/auth.controller');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/student/login', loginStudent);
router.post('/refresh', refreshToken);

module.exports = router;