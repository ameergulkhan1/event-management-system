const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config/env');
const errorHandler = require('./middlewares/errorHandler');
const { limiter } = require('./middlewares/rateLimiter');
const AppError = require('./utils/AppError');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Development logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// CORS Configuration (UPDATED)
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'https://eventhub-frontend-8sxud4ura-ameergulkhan1s-projects.vercel.app',
            'https://eventhub-frontend.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(null, true); // Allow all for now (or use false to block)
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Security middleware
app.use(helmet());
app.use(cors(corsOptions)); // ← Updated CORS
app.use(xss());
app.use(compression());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', limiter);

// Welcome route
app.get('/', (req, res) => {
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

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;