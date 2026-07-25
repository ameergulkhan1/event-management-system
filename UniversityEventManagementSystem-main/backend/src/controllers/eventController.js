const eventModel = require('../models/eventModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sanitizeInput } = require('../utils/validators');

const createEvent = catchAsync(async (req, res) => {
  const { title, description, date, time, venue, category, capacity } = req.body;

  if (!title || !date || !time || !venue || !category || !description) {
    throw new AppError('Required fields are missing', 400);
  }

  const user = req.user;

  const eventData = {
    title: sanitizeInput(title),
    description: sanitizeInput(description),
    date,
    time,
    venue: sanitizeInput(venue),
    category: sanitizeInput(category),
    capacity: capacity ? parseInt(capacity) : null,
    organizer: user.fullName,
    userEmail: user.email,
    userId: user.id,
    status: 'pending'
  };

  const eventId = await eventModel.createEvent(eventData);

  res.status(201).json({
    success: true,
    message: 'Event created successfully and is pending approval',
    data: { eventId },
  });
});

const getEvents = catchAsync(async (req, res) => {
  const { category, upcoming } = req.query;
  const filters = { status: 'approved' };
  if (category) filters.category = category;
  if (upcoming === 'true') filters.upcoming = true;

  const events = await eventModel.findAll(filters);
  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

const getEventById = catchAsync(async (req, res) => {
  const event = await eventModel.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  res.status(200).json({
    success: true,
    data: event,
  });
});

const getMyEvents = catchAsync(async (req, res) => {
  // Use userId for better performance
  const events = await eventModel.findByOrganizerId(req.user.id);
  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

const updateEvent = catchAsync(async (req, res) => {
  const event = await eventModel.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.userEmail !== req.user.email && event.userId !== req.user.id) {
    throw new AppError('You can only update your own events', 403);
  }

  if (event.status === 'approved') {
    throw new AppError('Approved events cannot be updated. Please contact admin.', 400);
  }

  const updated = await eventModel.updateEvent(req.params.id, req.body);
  if (!updated) {
    throw new AppError('Failed to update event', 400);
  }

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
  });
});

const deleteEvent = catchAsync(async (req, res) => {
  const event = await eventModel.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (req.user.role !== 'admin' && event.userEmail !== req.user.email && event.userId !== req.user.id) {
    throw new AppError('You can only delete your own events', 403);
  }

  const deleted = await eventModel.deleteEvent(req.params.id);
  if (!deleted) {
    throw new AppError('Failed to delete event', 400);
  }

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully',
  });
});

// Admin controllers
const getAllEventsAdmin = catchAsync(async (req, res) => {
  const events = await eventModel.findAll();
  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

const getPendingEvents = catchAsync(async (req, res) => {
  const events = await eventModel.findAll({ status: 'pending' });
  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

const approveEvent = catchAsync(async (req, res) => {
  const event = await eventModel.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status === 'approved') {
    throw new AppError('Event is already approved', 400);
  }

  const updated = await eventModel.updateStatus(req.params.id, 'approved');
  if (!updated) {
    throw new AppError('Failed to approve event', 400);
  }

  res.status(200).json({
    success: true,
    message: 'Event approved successfully',
  });
});

const rejectEvent = catchAsync(async (req, res) => {
  const event = await eventModel.findById(req.params.id);
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.status === 'rejected') {
    throw new AppError('Event is already rejected', 400);
  }

  const updated = await eventModel.updateStatus(req.params.id, 'rejected');
  if (!updated) {
    throw new AppError('Failed to reject event', 400);
  }

  res.status(200).json({
    success: true,
    message: 'Event rejected successfully',
  });
});

const getEventStats = catchAsync(async (req, res) => {
  const stats = await eventModel.getEventStats();
  res.status(200).json({
    success: true,
    data: stats,
  });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  getAllEventsAdmin,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getEventStats,
};