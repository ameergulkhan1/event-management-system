const { getConnection } = require('../config/database');

class EventModel {
  async createEvent(eventData) {
    const pool = await getConnection();
    const {
      title,
      description,
      date,
      time,
      venue,
      category,
      capacity,
      organizer,
      userEmail,
      userId,
      status = 'pending'
    } = eventData;

    const [result] = await pool.query(
      `INSERT INTO events 
       (title, description, date, time, venue, category, capacity, organizer, userEmail, userId, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, venue, category, capacity, organizer, userEmail, userId, status]
    );

    return result.insertId;
  }

  async findAll(filters = {}) {
    const pool = await getConnection();
    let query = `
      SELECT e.*, u.fullName as organizerName,
        (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
      FROM events e
      JOIN users u ON e.userId = u.id
      WHERE 1=1
    `;
    const values = [];

    if (filters.status) {
      query += ' AND e.status = ?';
      values.push(filters.status);
    }

    if (filters.category) {
      query += ' AND e.category = ?';
      values.push(filters.category);
    }

    if (filters.upcoming) {
      query += ' AND e.date >= CURDATE()';
    }

    query += ' ORDER BY e.date ASC, e.time ASC';
    const [rows] = await pool.query(query, values);
    return rows;
  }

  async findById(id) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT e.*, u.fullName as organizerName,
        (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
       FROM events e
       JOIN users u ON e.userId = u.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  async findByOrganizer(email) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
       FROM events e
       WHERE e.userEmail = ?
       ORDER BY e.createdAt DESC`,
      [email]
    );
    return rows;
  }

  async findByOrganizerId(userId) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
       FROM events e
       WHERE e.userId = ?
       ORDER BY e.createdAt DESC`,
      [userId]
    );
    return rows;
  }

  async updateEvent(id, eventData) {
    const pool = await getConnection();
    const fields = [];
    const values = [];

    const allowedFields = ['title', 'description', 'date', 'time', 'venue', 'category', 'capacity'];
    
    for (const field of allowedFields) {
      if (eventData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(eventData[field]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const pool = await getConnection();
    const [result] = await pool.query(
      'UPDATE events SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  async deleteEvent(id) {
    const pool = await getConnection();
    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async getEventStats() {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as totalEvents,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingEvents,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedEvents,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedEvents,
        SUM(CASE WHEN date >= CURDATE() THEN 1 ELSE 0 END) as upcomingEvents
       FROM events`
    );
    return rows[0];
  }

  // Get events by category
  async findByCategory(category) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT e.*, u.fullName as organizerName,
        (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
       FROM events e
       JOIN users u ON e.userId = u.id
       WHERE e.category = ? AND e.status = 'approved'
       ORDER BY e.date ASC`,
      [category]
    );
    return rows;
  }

  // Get upcoming events
  async getUpcomingEvents(limit = 10) {
    const pool = await getConnection();
    const [rows] = await pool.query(
      `SELECT e.*, u.fullName as organizerName,
        (SELECT COUNT(*) FROM registrations WHERE eventId = e.id) as registeredCount
       FROM events e
       JOIN users u ON e.userId = u.id
       WHERE e.date >= CURDATE() AND e.status = 'approved'
       ORDER BY e.date ASC, e.time ASC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
}

module.exports = new EventModel();