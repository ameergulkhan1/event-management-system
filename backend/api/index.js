const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('../src/routes/authRoutes');
const eventRoutes = require('../src/routes/eventRoutes');
const registrationRoutes = require('../src/routes/registrationRoutes');
const feedbackRoutes = require('../src/routes/feedbackRoutes');
const userRoutes = require('../src/routes/userRoutes');

// Import error handler
const errorHandler = require('../src/middlewares/errorHandler');
const AppError = require('../src/utils/AppError');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Welcome route
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to EventHub API',
        version: '1.0.0',
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', userRoutes);

// Handle 404
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Error handler
app.use(errorHandler);

// Export for Vercel
module.exports = app;
