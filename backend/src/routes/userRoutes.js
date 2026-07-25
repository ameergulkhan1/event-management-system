const express = require('express');
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getDashboardStats,
} = require('../controllers/userController');
const { protect, protectAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, protectAdmin, getAllUsers);
router.get('/:id', protect, protectAdmin, getUserById);
router.delete('/:id', protect, protectAdmin, deleteUser);
router.get('/admin/stats', protect, protectAdmin, getDashboardStats);

module.exports = router;