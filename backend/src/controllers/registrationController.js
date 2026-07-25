const registrationModel = require('../models/registrationModel');
const eventModel = require('../models/eventModel');

// ── REGISTER FOR EVENT ──
const register = async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for registration'
      });
    }

    if (event.capacity) {
      const registrations = await registrationModel.findByEvent(eventId);
      if (registrations.length >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Event is fully booked'
        });
      }
    }

    // Check if already registered
    const existing = await registrationModel.findOne(eventId, req.user.id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Create registration with userId
    await registrationModel.create(eventId, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event: ' + error.message
    });
  }
};

// ── GET MY REGISTRATIONS ──
const getMine = async (req, res) => {
  try {
    const registrations = await registrationModel.findByUser(req.user.id);
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('Get mine error:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }
};

// ── GET REGISTRATIONS FOR AN EVENT ──
const getForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Check if user is organizer or admin
    if (req.user.role !== 'admin' && event.userEmail !== req.user.email) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const registrations = await registrationModel.findByEvent(eventId);
    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }
};

// ── CANCEL REGISTRATION ──
const cancel = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registration = await registrationModel.findOne(eventId, req.user.id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    const deleted = await registrationModel.delete(eventId, req.user.id);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel registration'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration'
    });
  }
};

module.exports = {
  register,
  getMine,
  getForEvent,
  cancel,
};