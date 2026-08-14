const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { getMarksEntryForm, submitBulkMarks, getMyResults } = require('../controllers/mark.controller');
const { requireStudentAuth } = require('../middleware/studentAuth.middleware');


router.get('/:examId/form', requireAuth, getMarksEntryForm);
router.post('/:examId/bulk', requireAuth, submitBulkMarks);
router.get('/my-results', requireStudentAuth, getMyResults);

module.exports = router;