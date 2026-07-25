const app = require('./src/app');
const config = require('./src/config/env');
const { initializeAdmin } = require('./src/utils/initializeAdmin');

const PORT = config.port;

// Initialize admin user
const initialize = async () => {
  try {
    await initializeAdmin();
    console.log('✅ Admin initialization complete');
  } catch (error) {
    console.error('❌ Failed to initialize admin:', error);
  }
};

initialize();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${config.nodeEnv}`);
  console.log(`🔑 Admin email: ${config.admin.email}`);
  console.log(`📁 API URL: http://localhost:${PORT}/api`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = server;