const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Welcome to EventHub API' 
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Test route works!' 
    });
});

module.exports = app;
