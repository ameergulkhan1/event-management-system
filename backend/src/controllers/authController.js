const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const config = require('../config/env');
const { sanitizeInput } = require('../utils/validators');

const signup = catchAsync(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered. Please login.', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.rounds);

  // Create user
  const userId = await userModel.createUser({
    fullName: sanitizeInput(fullName),
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: userId, email: email.toLowerCase(), role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Get user data without password
  const user = await userModel.findById(userId);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email.toLowerCase());
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    },
  });
});

const getMe = catchAsync(async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  signup,
  login,
  getMe,
};