const mysql = require('mysql2/promise');
const config = require('./env');

let pool = null;

const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    console.log('✅ Database connection pool created');
  }
  return pool;
};

module.exports = { getConnection };