const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const aiService = require('../services/aiService');

/**
 * POST /api/ai/chat
 * AI chatbot endpoint. Uses Gemini 2.5 Flash to provide Shariah-compliant financial advice.
 * Persists the advice record in PostgreSQL.
 */
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const result = await aiService.generateChatReply(req.body);
    res.json(result);
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Server error generating AI response.'
    });
  }
});

module.exports = router;
