const AppError = require('../utils/AppError');

const validateEvent = (req, res, next) => {
  const { title, description, date, time, venue, category, capacity } = req.body;

  if (!title || !description || !date || !time || !venue || !category) {
    throw new AppError('All fields are required', 400);
  }

  if (title.length < 3) {
    throw new AppError('Title must be at least 3 characters', 400);
  }

  if (description.length < 10) {
    throw new AppError('Description must be at least 10 characters', 400);
  }

  if (category.length < 2) {
    throw new AppError('Category must be at least 2 characters', 400);
  }

  // Validate date is in the future
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (eventDate < today) {
    throw new AppError('Event date must be in the future', 400);
  }

  // Validate capacity
  if (capacity && (isNaN(capacity) || capacity < 1)) {
    throw new AppError('Capacity must be a positive number', 400);
  }

  next();
};

const validateEventUpdate = (req, res, next) => {
  const { title, description, date, time, venue, category, capacity } = req.body;

  if (!title && !description && !date && !time && !venue && !category && capacity === undefined) {
    throw new AppError('At least one field must be provided for update', 400);
  }

  if (title && title.length < 3) {
    throw new AppError('Title must be at least 3 characters', 400);
  }

  if (description && description.length < 10) {
    throw new AppError('Description must be at least 10 characters', 400);
  }

  if (date) {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      throw new AppError('Event date must be in the future', 400);
    }
  }

  if (capacity && (isNaN(capacity) || capacity < 1)) {
    throw new AppError('Capacity must be a positive number', 400);
  }

  next();
};

module.exports = {
  validateEvent,
  validateEventUpdate,
};