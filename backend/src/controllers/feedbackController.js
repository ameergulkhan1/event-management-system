const feedbackModel = require('../models/feedbackModel');
const eventModel = require('../models/eventModel');
const registrationModel = require('../models/registrationModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sanitizeInput } = require('../utils/validators');

const submitFeedback = catchAsync(async (req, res) => {
  const { eventId, rating, review, suggestion } = req.body;

  if (!eventId || !rating || !review) {
    throw new AppError('Event, rating and review are required', 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Check if event exists
  const event = await eventModel.findById(eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // Check if user is registered for the event
  const registration = await registrationModel.findOne(eventId, req.user.email);
  if (!registration) {
    throw new AppError('You must be registered for this event to submit feedback', 403);
  }

  // Check if user already submitted feedback
  const existingFeedback = await feedbackModel.findByUser(req.user.id);
  const alreadySubmitted = existingFeedback.some(f => f.eventId === parseInt(eventId));
  if (alreadySubmitted) {
    throw new AppError('You have already submitted feedback for this event', 400);
  }

  const feedbackId = await feedbackModel.create({
    eventId,
    userId: req.user.id,
    rating,
    review: sanitizeInput(review),
    suggestion: suggestion ? sanitizeInput(suggestion) : null,
  });

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { feedbackId },
  });
});

const getAllFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackModel.findAll();
  res.status(200).json({
    success: true,
    count: feedback.length,
    data: feedback,
  });
});

const getMyFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackModel.findByUser(req.user.id);
  res.status(200).json({
    success: true,
    count: feedback.length,
    data: feedback,
  });
});

const getEventFeedback = catchAsync(async (req, res) => {
  const event = await eventModel.findById(req.params.eventId);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const feedback = await feedbackModel.findByEvent(req.params.eventId);
  res.status(200).json({
    success: true,
    count: feedback.length,
    data: feedback,
  });
});

const getFeedbackStats = catchAsync(async (req, res) => {
  const stats = await feedbackModel.getFeedbackStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

module.exports = {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  getEventFeedback,
  getFeedbackStats,
};