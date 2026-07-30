const express = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validateSignup, validateLogin } = require('../validations/authValidation');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;