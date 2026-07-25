const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Handle specific MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry. This record already exists.';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Invalid reference. The referenced record does not exist.';
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong on the server';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

module.exports = errorHandler;