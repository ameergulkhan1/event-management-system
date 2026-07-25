const { getConnection } = require('../config/database');

class RegistrationModel {
  async create(eventId, userId) {
    const pool = await getConnection();
    try {
      const [result] = await pool.query(
        'INSERT INTO registrations (eventId, userId) VALUES (?, ?)',
        [eventId, userId]
      );
      return result.insertId;
    } catch (error) {
      console.error('Create registration error:', error);
      throw error;
    }
  }

  async findOne(eventId, userId) {
    const pool = await getConnection();
    try {
      const [rows] = await pool.query(
        'SELECT * FROM registrations WHERE eventId = ? AND userId = ?',
        [eventId, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('FindOne error:', error);
      return null;
    }
  }

  async findByUser(userId) {
    const pool = await getConnection();
    try {
      const [rows] = await pool.query(
        `SELECT r.*, e.title, e.date, e.time, e.venue, e.status as eventStatus
         FROM registrations r
         JOIN events e ON r.eventId = e.id
         WHERE r.userId = ?
         ORDER BY r.createdAt DESC`,
        [userId]
      );
      return rows || [];
    } catch (error) {
      console.error('FindByUser error:', error);
      return [];
    }
  }

  async findByEvent(eventId) {
    const pool = await getConnection();
    try {
      const [rows] = await pool.query(
        `SELECT r.*, u.fullName as studentName, u.email as studentEmail
         FROM registrations r
         JOIN users u ON r.userId = u.id
         WHERE r.eventId = ?
         ORDER BY r.createdAt DESC`,
        [eventId]
      );
      return rows || [];
    } catch (error) {
      console.error('FindByEvent error:', error);
      return [];
    }
  }

  async delete(eventId, userId) {
    const pool = await getConnection();
    try {
      const [result] = await pool.query(
        'DELETE FROM registrations WHERE eventId = ? AND userId = ?',
        [eventId, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  async getRegistrationStats() {
    const pool = await getConnection();
    try {
      const [rows] = await pool.query(
        `SELECT 
          COUNT(*) as totalRegistrations,
          COUNT(DISTINCT eventId) as totalEventsWithRegistrations,
          COUNT(DISTINCT userId) as totalUniqueUsers
         FROM registrations`
      );
      return rows[0] || { totalRegistrations: 0, totalEventsWithRegistrations: 0, totalUniqueUsers: 0 };
    } catch (error) {
      console.error('GetRegistrationStats error:', error);
      return { totalRegistrations: 0, totalEventsWithRegistrations: 0, totalUniqueUsers: 0 };
    }
  }
}

module.exports = new RegistrationModel();