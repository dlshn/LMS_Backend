const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { getMarksEntryForm, submitBulkMarks } = require('../controllers/mark.controller');

router.get('/:examId/form', requireAuth, getMarksEntryForm);
router.post('/:examId/bulk', requireAuth, submitBulkMarks);

module.exports = router;