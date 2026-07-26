const mysql = require('mysql2/promise');

let pool = null;

const getConnection = async () => {
    if (!pool) {
        console.log('🔍 Environment variables:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_PORT:', process.env.DB_PORT);
        
        // Try to use DATABASE_URL first (Railway provides this)
        const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
        
        if (connectionString) {
            console.log('✅ Using DATABASE_URL for connection');
            pool = mysql.createPool({
                uri: connectionString,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                ssl: {
                    rejectUnauthorized: false
                }
            });
        } else {
            console.log('✅ Using individual DB variables');
            pool = mysql.createPool({
                host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
                user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
                password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
                database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'event_management',
                port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                ssl: {
                    rejectUnauthorized: false
                }
            });
        }
    }
    return pool;
};

module.exports = { getConnection };