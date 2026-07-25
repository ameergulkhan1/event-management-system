const express = require('express');
const {
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
} = require('../controllers/eventController');
const { protect, protectAdmin, protectOrganizer } = require('../middlewares/auth');
const { validateEvent, validateEventUpdate } = require('../validations/eventValidation');

const router = express.Router();

// ── PUBLIC ROUTES ──
router.get('/', getEvents);

// ── ADMIN ROUTES (BEFORE PARAMETER ROUTES) ──
router.get('/admin/all', protect, protectAdmin, getAllEventsAdmin);
router.get('/admin/pending', protect, protectAdmin, getPendingEvents);
router.put('/admin/:id/approve', protect, protectAdmin, approveEvent);
router.put('/admin/:id/reject', protect, protectAdmin, rejectEvent);
router.get('/admin/stats', protect, protectAdmin, getEventStats);

// ── ORGANIZER ROUTES (BEFORE PARAMETER ROUTES) ──
router.get('/my-events', protect, protectOrganizer, getMyEvents);
router.post('/', protect, protectOrganizer, validateEvent, createEvent);
router.put('/:id', protect, protectOrganizer, validateEventUpdate, updateEvent);
router.delete('/:id', protect, protectOrganizer, deleteEvent);

// ── PUBLIC ROUTE WITH PARAMETER (ALWAYS LAST) ──
router.get('/:id', getEventById);

module.exports = router;