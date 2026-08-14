const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, loginStudent } = require('../controllers/auth.controller');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/student/login', loginStudent);

module.exports = router;