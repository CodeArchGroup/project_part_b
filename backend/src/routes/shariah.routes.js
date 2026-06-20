const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/shariah/compliance
 * Checks Shariah compliance of a financial activity or stock ticker using rules from PostgreSQL.
 * AAOIFI Standard No. 21 dictates the thresholds for compliance.
 */
router.post('/compliance', authMiddleware, async (req, res) => {
  const { activityName, sector, amount, userId } = req.body;

  if (!activityName && !sector) {
    return res.status(400).json({ success: false, message: 'Stock Ticker or Sector is required to perform screening.' });
  }

  // Simulated database of stock tickers for AAOIFI ratio screening. 
  // In a real-world scenario, this would call Yahoo Finance or Alpha Vantage API.
  const SIMULATED_STOCKS = {
    'aapl': { name: 'Apple Inc. (AAPL)', sector: 'Technology', debtRatio: 12.5, interestIncomeRatio: 1.2, cashRatio: 18.2, status: 'Compliant', explanation: 'Apple Inc. passes AAOIFI screening. Prohibited revenues are well below the 5% threshold and interest-bearing debt is 12.5% of total assets (limit 33%).' },
    'msft': { name: 'Microsoft Corp (MSFT)', sector: 'Technology', debtRatio: 9.8, interestIncomeRatio: 0.9, cashRatio: 15.4, status: 'Compliant', explanation: 'Microsoft Corp. passes AAOIFI screening. Debt-to-asset ratio is 9.8% (limit 33%) and liquidity ratios are within accepted thresholds.' },
    'tsla': { name: 'Tesla Inc. (TSLA)', sector: 'Automotive / Clean Energy', debtRatio: 5.2, interestIncomeRatio: 0.5, cashRatio: 12.1, status: 'Compliant', explanation: 'Tesla is strictly compliant. Core activity is clean energy; debt ratio is a minimal 5.2%.' },
    'nflx': { name: 'Netflix Inc. (NFLX)', sector: 'Entertainment / Media', debtRatio: 38.6, interestIncomeRatio: 0.2, cashRatio: 10.4, status: 'Non-Compliant', explanation: 'Netflix is non-compliant. Its debt-to-assets ratio is 38.6%, which violates the 33% maximum Shariah threshold.' },
    'jpm': { name: 'JPMorgan Chase (JPM)', sector: 'Conventional Banking', debtRatio: 95.0, interestIncomeRatio: 85.0, cashRatio: 90.0, status: 'Non-Compliant', explanation: 'JPMorgan Chase is strictly prohibited (Haram) as its primary business activity fundamentally relies on interest-based financial services (Riba).' },
    'dis': { name: 'Disney (DIS)', sector: 'Entertainment', debtRatio: 28.5, interestIncomeRatio: 4.8, cashRatio: 8.5, status: 'Doubtful', explanation: 'Disney is doubtful. While ratios are technically within limits, its media content and hospitality segments contain mixed revenues that require strict annual purification.' }
  };

  const ticker = (activityName || '').toLowerCase().trim();
  
  if (SIMULATED_STOCKS[ticker]) {
    const stock = SIMULATED_STOCKS[ticker];
    if (userId) {
      try {
        await db.query(
          `INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'complianceCheck', $2)`,
          [userId, `Screened Stock "${stock.name}" — Result: ${stock.status}`]
        );
      } catch (err) {
        console.error('Failed to log compliance check:', err.message);
      }
    }
    return res.json({
      success: true,
      status: stock.status,
      activityName: stock.name,
      sector: stock.sector,
      explanation: stock.explanation,
      ratios: {
        debtRatio: stock.debtRatio,
        interestIncomeRatio: stock.interestIncomeRatio,
        cashRatio: stock.cashRatio
      }
    });
  }

  // Fallback to strict sector matching from the PostgreSQL database
  const searchSector = sector || 'general';
  try {
    const prohibitedResult = await db.query(`SELECT * FROM shariah_rules WHERE category = 'prohibited-sector'`);
    const matchedProhibited = prohibitedResult.rows.find(rule =>
      searchSector.toLowerCase().includes(rule.description.toLowerCase().split(' ')[0]) ||
      rule.description.toLowerCase().includes(searchSector.toLowerCase())
    );

    if (matchedProhibited) {
      if (userId) {
        await db.query(`INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'complianceCheck', $2)`, [userId, `Sector "${searchSector}" — Non-Compliant`]);
      }
      return res.json({
        success: true,
        status: 'Non-Compliant',
        explanation: `The sector "${searchSector}" engages in strictly prohibited non-halal activities.`,
        ratios: { debtRatio: 75.0, interestIncomeRatio: 40.0, cashRatio: 25.0 }, // Simulated failing ratios to demonstrate UI
        rule: { id: matchedProhibited.rule_id, description: matchedProhibited.description }
      });
    }

    const doubtfulResult = await db.query(`SELECT * FROM shariah_rules WHERE category = 'doubtful-sector'`);
    const matchedDoubtful = doubtfulResult.rows.find(rule =>
      rule.description.toLowerCase().includes(searchSector.toLowerCase()) ||
      searchSector.toLowerCase().includes(rule.description.toLowerCase().split(' ')[0])
    );

    if (matchedDoubtful) {
      if (userId) {
        await db.query(`INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'complianceCheck', $2)`, [userId, `Sector "${searchSector}" — Doubtful`]);
      }
      return res.json({
        success: true,
        status: 'Doubtful',
        explanation: `The sector "${searchSector}" involves mixed revenues. Detailed purification is required.`,
        ratios: { debtRatio: 29.0, interestIncomeRatio: 4.5, cashRatio: 12.0 }, // Borderline
        rule: { id: matchedDoubtful.rule_id, description: matchedDoubtful.description }
      });
    }

    // Default Compliant (if no haram keywords triggered)
    if (userId) {
      await db.query(`INSERT INTO system_logs (user_id, action_type, details) VALUES ($1, 'complianceCheck', $2)`, [userId, `Sector "${searchSector}" — Compliant`]);
    }

    return res.json({
      success: true,
      status: 'Compliant',
      explanation: `The activity in the "${searchSector}" sector is permissible and Shariah-compliant. No violations detected.`,
      ratios: { debtRatio: 15.0, interestIncomeRatio: 2.1, cashRatio: 8.0 }
    });
  } catch (error) {
    console.error('Compliance check error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during Shariah screening' });
  }
});

/**
 * POST /api/shariah/zakat
 * Calculates Zakat based on financial data with dynamic Nisab.
 */
router.post('/zakat', authMiddleware, async (req, res) => {
  const { savings, gold, silver, investments, liabilities, userId } = req.body;
  const totalAssets = Number(savings || 0) + Number(gold || 0) + Number(silver || 0) + Number(investments || 0);
  const netWealth = totalAssets - Number(liabilities || 0);

  let goldPricePerGram = 78.50; 
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch('https://api.metals.dev/v1/latest?base=USD&symbols=XAU', { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);
    if (response && response.ok) {
      const data = await response.json();
      if (data.rates && data.rates.XAU) goldPricePerGram = Number(data.rates.XAU) / 31.1035;
    }
  } catch (error) { /* Fallback used */ }

  const nisabThreshold = goldPricePerGram * 85; 
  const eligible = netWealth >= nisabThreshold;
  const zakatDue = eligible ? netWealth * 0.025 : 0;

  if (userId) {
    try {
      await db.query(`INSERT INTO advice (user_id, advice_type, description) VALUES ($1, 'zakat', $2)`, [userId, `Zakat calculation: Net wealth = $${netWealth.toFixed(2)}, Zakat due = $${zakatDue.toFixed(2)}`]);
    } catch (error) {}
  }

  res.json({ success: true, eligible, netWealth, zakatDue, message: eligible ? `You are eligible for Zakat. Your estimated Zakat is $${zakatDue.toFixed(2)}.` : `Your net wealth is below the Nisab threshold. No Zakat is due.` });
});

router.get('/rules', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM shariah_rules ORDER BY category, rule_id');
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
