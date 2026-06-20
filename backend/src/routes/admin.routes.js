const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const auditService = require('../services/auditService');

// Apply middleware stack: first verify authentication, then verify admin role
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

  // Validation
  if (!userId || !role) {
    return res.status(400).json({
      success: false,
      message: 'UserId and role are required.'
    });
  }

  // Verify role is valid
  if (!['Admin', 'User'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be "Admin" or "User".'
    });
  }

  try {
    const result = await db.query(
      'UPDATE users SET user_type = $1 WHERE user_id = $2 RETURNING user_id, name, user_type',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Log the role change for audit trail
    await auditService.logRoleChange(req.user.uid, userId, role);

    res.json({
      success: true,
      message: `User role securely updated to ${role}.`,
      data: result.rows[0]
    });
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
    const logs = await auditService.getAuditLogs();
    res.json({ success: true, data: logs });
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

  // Validation
  if (!category || !description) {
    return res.status(400).json({
      success: false,
      message: 'Category and description are absolutely required.'
    });
  }

  // Verify category is valid
  const validCategories = [
    'prohibited-sector',
    'doubtful-sector',
    'financial-ratio',
    'zakat'
  ];
  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category.'
    });
  }

  try {
    if (ruleId) {
      // UPDATE existing rule
      const result = await db.query(
        `UPDATE shariah_rules 
         SET category = $1, description = $2, source_reference = $3 
         WHERE rule_id = $4 
         RETURNING *`,
        [category, description, sourceReference || null, ruleId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Rule not found.' });
      }

      // Log the update
      await auditService.logRuleUpdate(req.user.uid, ruleId, category);

      return res.json({
        success: true,
        message: 'Rule updated successfully.',
        data: result.rows[0]
      });
    } else {
      // CREATE new rule
      const result = await db.query(
        `INSERT INTO shariah_rules (category, description, source_reference) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [category, description, sourceReference || null]
      );

      // Log the creation
      await auditService.logRuleCreate(req.user.uid, result.rows[0].rule_id, category);

      return res.status(201).json({
        success: true,
        message: 'Rule deployed to engine successfully.',
        data: result.rows[0]
      });
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
    const result = await db.query(
      'DELETE FROM shariah_rules WHERE rule_id = $1 RETURNING *',
      [ruleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rule not found.' });
    }

    // Log the deletion
    await auditService.logRuleDelete(req.user.uid, ruleId);

    res.json({
      success: true,
      message: 'Rule permanently deleted.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Admin delete rule error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete rule.' });
  }
});

module.exports = router;
