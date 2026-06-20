const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all goals routes
router.use(authMiddleware);

/**
 * GET /api/goals
 * Fetches all goals for the logged-in user.
 */
router.get('/', async (req, res) => {
  const userId = req.user.uid;

  try {
    const result = await db.query(
      'SELECT * FROM financial_goals WHERE user_id = $1 ORDER BY created_date DESC',
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch goals error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching goals.' });
  }
});

/**
 * POST /api/goals
 * Creates a new financial goal or updates an existing one.
 */
router.post('/', async (req, res) => {
  const userId = req.user.uid;
  const { goalId, goalType, targetAmount, currentAmount, deadline, status } = req.body;

  if (!goalType || !targetAmount) {
    return res.status(400).json({ success: false, message: 'Goal type and target amount are required.' });
  }

  try {
    if (goalId) {
      // Update
      const result = await db.query(
        `UPDATE financial_goals 
         SET goal_type = $1, target_amount = $2, current_amount = $3, deadline = $4, status = $5, updated_date = NOW()
         WHERE goal_id = $6 AND user_id = $7
         RETURNING *`,
        [goalType, targetAmount, currentAmount || 0, deadline || null, status || 'active', goalId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Goal not found or unauthorized.' });
      }

      await db.query(
        `INSERT INTO system_logs (user_id, action_type, details)
         VALUES ($1, 'updateGoal', $2)`,
        [userId, `Updated goal: ${goalType} (ID: ${goalId})`]
      );

      return res.json({ success: true, message: 'Goal updated successfully.', data: result.rows[0] });
    } else {
      // Create
      const result = await db.query(
        `INSERT INTO financial_goals (user_id, goal_type, target_amount, current_amount, deadline, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, goalType, targetAmount, currentAmount || 0, deadline || null, status || 'active']
      );

      await db.query(
        `INSERT INTO system_logs (user_id, action_type, details)
         VALUES ($1, 'createGoal', $2)`,
        [userId, `Created new goal: ${goalType}`]
      );

      return res.status(201).json({ success: true, message: 'Goal created successfully.', data: result.rows[0] });
    }
  } catch (error) {
    console.error('Save goal error:', error.message);
    res.status(500).json({ success: false, message: 'Server error saving goal.' });
  }
});

/**
 * DELETE /api/goals/:goalId
 * Deletes a financial goal.
 */
router.delete('/:goalId', async (req, res) => {
  const userId = req.user.uid;
  const { goalId } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM financial_goals WHERE goal_id = $1 AND user_id = $2 RETURNING *',
      [goalId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Goal not found or unauthorized.' });
    }

    await db.query(
      `INSERT INTO system_logs (user_id, action_type, details)
       VALUES ($1, 'deleteGoal', $2)`,
      [userId, `Deleted goal ID: ${goalId}`]
    );

    res.json({ success: true, message: 'Goal deleted successfully.', data: result.rows[0] });
  } catch (error) {
    console.error('Delete goal error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting goal.' });
  }
});

module.exports = router;
