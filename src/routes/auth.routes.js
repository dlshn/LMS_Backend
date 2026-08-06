const express = require('express');
const router = express.Router();
const { registerAdmin } = require('../controllers/auth.controller');

router.post('/register', registerAdmin);

module.exports = router;