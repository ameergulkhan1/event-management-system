const AppError = require('../utils/AppError');

const validateFeedback = (req, res, next) => {
  const { eventId, rating, review, suggestion } = req.body;

  if (!eventId || !rating || !review) {
    throw new AppError('Event ID, rating, and review are required', 400);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError('Rating must be an integer between 1 and 5', 400);
  }

  if (review.length < 3) {
    throw new AppError('Review must be at least 3 characters', 400);
  }

  if (suggestion && suggestion.length < 3) {
    throw new AppError('Suggestion must be at least 3 characters', 400);
  }

  next();
};

module.exports = {
  validateFeedback,
};