const express = require('express');
const {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  getEventFeedback,
  getFeedbackStats,
} = require('../controllers/feedbackController');
const { protect, protectAdmin } = require('../middlewares/auth');
const { validateFeedback } = require('../validations/feedbackValidation');

const router = express.Router();

router.post('/', protect, validateFeedback, submitFeedback);
router.get('/my', protect, getMyFeedback);
router.get('/event/:eventId', protect, getEventFeedback);
router.get('/admin/all', protect, protectAdmin, getAllFeedback);
router.get('/admin/stats', protect, protectAdmin, getFeedbackStats);

module.exports = router;