const { getConnection } = require('../config/database');
const AppError = require('../utils/AppError');

class UserModel {
  async findByEmail(email) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      'SELECT id, fullName, email, role, createdAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async createUser(userData) {
    const pool = await getConnection();
    const { fullName, email, password, role } = userData;
    
    const [result] = await pool.query(
      `INSERT INTO users (fullName, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [fullName, email, password, role]
    );
    
    return result.insertId;
  }

  async getAllUsers() {
    const pool = await getConnection();
    const [rows] = await pool.query(
      'SELECT id, fullName, email, role, createdAt FROM users ORDER BY createdAt DESC'
    );
    return rows;
  }

  async updateUser(id, userData) {
    const pool = await getConnection();
    const fields = [];
    const values = [];

    if (userData.fullName) {
      fields.push('fullName = ?');
      values.push(userData.fullName);
    }
    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteUser(id) {
    const pool = await getConnection();
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ? AND role != "admin"',
      [id]
    );
    return result.affectedRows > 0;
  }

  async getUserStats() {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as studentsCount,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizersCount
       FROM users`
    );
    return rows[0];
  }
}

module.exports = new UserModel();