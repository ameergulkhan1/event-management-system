const userModel = require('../models/userModel');
const eventModel = require('../models/eventModel');
const registrationModel = require('../models/registrationModel');
const feedbackModel = require('../models/feedbackModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userModel.getAllUsers();
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (user.role === 'admin') {
    throw new AppError('Cannot delete admin user', 403);
  }
  const deleted = await userModel.deleteUser(req.params.id);
  if (!deleted) {
    throw new AppError('Failed to delete user', 400);
  }
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

const getDashboardStats = catchAsync(async (req, res) => {
  try {
    const userStats = await userModel.getUserStats();
    const eventStats = await eventModel.getEventStats();
    const regStats = await registrationModel.getRegistrationStats();
    const feedbackStats = await feedbackModel.getFeedbackStats();

    res.status(200).json({
      success: true,
      data: {
        users: userStats || { totalUsers: 0, studentsCount: 0, organizersCount: 0 },
        events: eventStats || { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, rejectedEvents: 0, upcomingEvents: 0 },
        registrations: regStats || { totalRegistrations: 0, totalEventsWithRegistrations: 0, totalUniqueUsers: 0 },
        feedback: feedbackStats || { totalFeedback: 0, averageRating: 0, eventsWithFeedback: 0, usersWithFeedback: 0 },
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(200).json({
      success: true,
      data: {
        users: { totalUsers: 0, studentsCount: 0, organizersCount: 0 },
        events: { totalEvents: 0, pendingEvents: 0, approvedEvents: 0, rejectedEvents: 0, upcomingEvents: 0 },
        registrations: { totalRegistrations: 0, totalEventsWithRegistrations: 0, totalUniqueUsers: 0 },
        feedback: { totalFeedback: 0, averageRating: 0, eventsWithFeedback: 0, usersWithFeedback: 0 },
      },
    });
  }
});

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  getDashboardStats,
};