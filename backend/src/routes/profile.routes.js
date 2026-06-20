const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

// Apply middleware to all profile routes
router.use(authMiddleware);

/**
 * GET /api/profile/:userId
 * Fetches a user's financial profile from PostgreSQL.
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM financial_profiles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0] });
    }

    return res.status(404).json({ success: false, message: 'Profile not found' });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/profile
 * Creates or updates a user's financial profile.
 * Body: { userId, income, assets, liabilities, savings }
 */
router.post('/', async (req, res) => {
  const { userId, income, assets, liabilities, savings } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO financial_profiles (user_id, income, assets, liabilities, savings, created_date, updated_date)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET income = $2,
           assets = $3,
           liabilities = $4,
           savings = $5,
           updated_date = NOW()
       RETURNING *`,
      [userId, income || 0, assets || 0, liabilities || 0, savings || 0]
    );

    // Log the action
    await db.query(
      `INSERT INTO system_logs (user_id, action_type, details)
       VALUES ($1, 'updateProfile', 'Financial profile created/updated')`,
      [userId]
    );

    return res.json({
      success: true,
      message: 'Profile created/updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Create/update profile error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
