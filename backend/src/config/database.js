const mysql = require('mysql2/promise');

let pool = null;

const getConnection = async () => {
    if (!pool) {
        // Debug: Log all environment variables
        console.log('🔍 Environment Variables:');
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB_PORT:', process.env.DB_PORT);
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
        
        // Try DATABASE_URL first
        const dbUrl = process.env.DATABASE_URL;
        
        if (dbUrl) {
            console.log('✅ Using DATABASE_URL');
            try {
                pool = mysql.createPool({
                    uri: dbUrl,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0,
                    ssl: {
                        rejectUnauthorized: false
                    }
                });
                
                // Test connection
                const conn = await pool.getConnection();
                console.log('✅ Database connected successfully!');
                conn.release();
                return pool;
            } catch (err) {
                console.error('❌ DATABASE_URL connection failed:', err.message);
                // Fall through to individual variables
            }
        }
        
        // Fallback to individual variables
        console.log('✅ Using individual DB variables');
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'event_management',
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            ssl: {
                rejectUnauthorized: false
            }
        };
        
        console.log('DB Config:', {
            host: config.host,
            user: config.user,
            database: config.database,
            port: config.port
        });
        
        try {
            pool = mysql.createPool(config);
            const conn = await pool.getConnection();
            console.log('✅ Database connected successfully with individual variables!');
            conn.release();
        } catch (err) {
            console.error('❌ Individual variables connection failed:', err.message);
            throw err;
        }
    }
    return pool;
};

module.exports = { getConnection };