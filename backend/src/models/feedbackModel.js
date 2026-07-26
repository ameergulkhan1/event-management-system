const { getConnection } = require('../config/database');

class FeedbackModel {
  async create(feedbackData) {
    const pool = await getConnection();
    const { eventId, userId, rating, review, suggestion } = feedbackData;

    const [result] = await pool.query(
      `INSERT INTO feedback (eventId, userId, rating, review, suggestion) 
       VALUES (?, ?, ?, ?, ?)`,
      [eventId, userId, rating, review, suggestion || null]
    );

    return result.insertId;
  }

  async findAll() {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT f.*, u.fullName as studentName, e.title as eventTitle
       FROM feedback f
       JOIN users u ON f.userId = u.id
       JOIN events e ON f.eventId = e.id
       ORDER BY f.createdAt DESC`
    );
    return rows;
  }

  async findByEvent(eventId) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT f.*, u.fullName as studentName
       FROM feedback f
       JOIN users u ON f.userId = u.id
       WHERE f.eventId = ?
       ORDER BY f.createdAt DESC`,
      [eventId]
    );
    return rows;
  }

  async findByUser(userId) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT f.*, e.title as eventTitle
       FROM feedback f
       JOIN events e ON f.eventId = e.id
       WHERE f.userId = ?
       ORDER BY f.createdAt DESC`,
      [userId]
    );
    return rows;
  }

  async getFeedbackStats() {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as totalFeedback,
        COALESCE(AVG(rating), 0) as averageRating,
        COUNT(DISTINCT eventId) as eventsWithFeedback,
        COUNT(DISTINCT userId) as usersWithFeedback
       FROM feedback`
    );
    return rows[0];
  }
}

module.exports = new FeedbackModel();