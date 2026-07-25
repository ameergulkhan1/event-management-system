const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const config = require('../config/env');
const userModel = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to access this resource.', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Your token has expired. Please log in again.', 401));
    } else {
      next(error);
    }
  }
};

const protectAdmin = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user.role !== 'admin') {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }
    next();
  });
};

const protectOrganizer = async (req, res, next) => {
  await protect(req, res, () => {
    if (!['organizer', 'admin'].includes(req.user.role)) {
      throw new AppError('Access denied. Organizer privileges required.', 403);
    }
    next();
  });
};

const protectStudent = async (req, res, next) => {
  await protect(req, res, () => {
    if (!['student', 'admin'].includes(req.user.role)) {
      throw new AppError('Access denied. Student privileges required.', 403);
    }
    next();
  });
};

module.exports = {
  protect,
  protectAdmin,
  protectOrganizer,
  protectStudent,
};