const { validateEmail, validatePassword } = require('../utils/validators');
const AppError = require('../utils/AppError');

const validateSignup = (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password || !role) {
    throw new AppError('All fields are required', 400);
  }

  if (fullName.length < 2) {
    throw new AppError('Full name must be at least 2 characters', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (!validatePassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number',
      400
    );
  }

  if (!['student', 'organizer'].includes(role)) {
    throw new AppError('Invalid role. Role must be either student or organizer', 400);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
};