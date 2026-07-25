const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const config = require('../config/env');

const initializeAdmin = async () => {
  try {
    const adminEmail = config.admin.email;
    const adminPassword = config.admin.password;
    const adminName = config.admin.name;

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️ Admin credentials not found in environment variables');
      return;
    }

    const existingAdmin = await userModel.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, config.bcrypt.rounds);
      
      await userModel.createUser({
        fullName: adminName || 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};

module.exports = { initializeAdmin };