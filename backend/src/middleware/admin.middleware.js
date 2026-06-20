const db = require('../db');

const adminMiddleware = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT user_type FROM users WHERE user_id = $1',
      [req.user.uid]
    );

    if (!result.rows[0] || result.rows[0].user_type !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to verify admin permissions.' });
  }
};

module.exports = adminMiddleware;
