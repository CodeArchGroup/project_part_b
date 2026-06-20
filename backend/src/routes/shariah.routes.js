const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const complianceService = require('../services/complianceService');
const zakatService = require('../services/zakatService');

/**
 * POST /api/shariah/compliance
 * Checks Shariah compliance of a financial activity or stock ticker using rules from PostgreSQL.
 * AAOIFI Standard No. 21 dictates the thresholds for compliance.
 */
router.post('/compliance', authMiddleware, async (req, res) => {
  try {
    const result = await complianceService.checkCompliance(req.body);
    return res.json(result);
  } catch (error) {
    console.error('Compliance check error:', error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Server error during Shariah screening'
    });
  }
});

/**
 * POST /api/shariah/zakat
 * Calculates Zakat based on financial data with dynamic Nisab.
 */
router.post('/zakat', authMiddleware, async (req, res) => {
  try {
    const result = await zakatService.calculateZakat(req.body);
    res.json(result);
  } catch (error) {
    console.error('Zakat calculation error:', error.message);
    res.status(500).json({ success: false, message: 'Server error calculating Zakat.' });
  }
});

router.get('/rules', authMiddleware, async (req, res) => {
  try {
    const rules = await complianceService.getRules();
    return res.json({ success: true, data: rules });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
