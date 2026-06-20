const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

// Strict Middleware to verify Admin user type
const adminMiddleware = async (req, res, next) => {
  try {
    const result = await db.query('SELECT user_type FROM users WHERE user_id = $1', [req.user.uid]);
    if (result.rows.length === 0 || result.rows[0].user_type !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Security clearance level Admin required.' });
    }
    next();
  } catch (err) {
    console.error('Admin middleware error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error verifying permissions.' });
  }
};

router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/admin/users
 * Lists all registered user accounts securely.
 */
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT user_id, name, email, phone, user_type, created_date FROM users ORDER BY created_date DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin fetch users error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

/**
 * POST /api/admin/users/role
 * Toggles a user account role between User and Admin.
 */
router.post('/users/role', async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ success: false, message: 'UserId and role are required.' });
  }

  try {
    const result = await db.query(
      'UPDATE users SET user_type = $1 WHERE user_id = $2 RETURNING user_id, name, user_type',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await db.query(
      `INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'updateUserRole', $2)`,
      [req.user.uid, `Changed security role for user ${userId} to [${role.toUpperCase()}]`]
    );

    res.json({ success: true, message: `User role securely updated to ${role}.`, data: result.rows[0] });
  } catch (error) {
    console.error('Admin update role error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
});

/**
 * GET /api/admin/logs
 * Fetches the system activity audit trails.
 */
router.get('/logs', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT l.log_id, l.action_type, l.timestamp, l.details, u.name as user_name, u.email as user_email
       FROM system_logs l
       LEFT JOIN users u ON l.user_id = u.user_id
       ORDER BY l.timestamp DESC
       LIMIT 150`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin fetch logs error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch system logs.' });
  }
});

/**
 * POST /api/admin/rules
 * Creates or updates a Shariah compliance engine rule.
 */
router.post('/rules', async (req, res) => {
  const { ruleId, category, description, sourceReference } = req.body;
  if (!category || !description) {
    return res.status(400).json({ success: false, message: 'Category and description are absolutely required.' });
  }

  try {
    if (ruleId) {
      const result = await db.query(
        `UPDATE shariah_rules SET category = $1, description = $2, source_reference = $3 WHERE rule_id = $4 RETURNING *`,
        [category, description, sourceReference || null, ruleId]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Rule not found.' });

      await db.query(`INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'updateRule', $2)`, [req.user.uid, `Updated compliance rule [${ruleId}] in category: ${category}`]);
      return res.json({ success: true, message: 'Rule updated successfully.', data: result.rows[0] });
    } else {
      const result = await db.query(
        `INSERT INTO shariah_rules (category, description, source_reference) VALUES ($1, $2, $3) RETURNING *`,
        [category, description, sourceReference || null]
      );

      await db.query(`INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'createRule', $2)`, [req.user.uid, `Created new compliance rule in category: ${category}`]);
      return res.status(201).json({ success: true, message: 'Rule deployed to engine successfully.', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Admin save rule error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to deploy Shariah rule.' });
  }
});

/**
 * DELETE /api/admin/rules/:ruleId
 * Deletes a Shariah rule from the compliance engine.
 */
router.delete('/rules/:ruleId', async (req, res) => {
  const { ruleId } = req.params;

  try {
    const result = await db.query('DELETE FROM shariah_rules WHERE rule_id = $1 RETURNING *', [ruleId]);

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Rule not found.' });

    await db.query(`INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'deleteRule', $2)`, [req.user.uid, `Terminated compliance rule ID: ${ruleId}`]);
    res.json({ success: true, message: 'Rule permanently deleted.', data: result.rows[0] });
  } catch (error) {
    console.error('Admin delete rule error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete rule.' });
  }
});

module.exports = router;
