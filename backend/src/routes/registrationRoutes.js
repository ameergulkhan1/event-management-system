const express = require('express');
const { 
  register, 
  getMine, 
  getForEvent, 
  cancel 
} = require('../controllers/registrationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes
router.post('/', register);
router.get('/my', getMine);
router.delete('/:eventId', cancel);

// Get registrations for an event (organizer/admin)
router.get('/event/:eventId', getForEvent);

module.exports = router;