const db = require('../db');
const auditService = require('./auditService');

const SIMULATED_STOCKS = {
  aapl: { name: 'Apple Inc. (AAPL)', sector: 'Technology', debtRatio: 12.5, interestIncomeRatio: 1.2, cashRatio: 18.2, status: 'Compliant', explanation: 'Apple Inc. passes AAOIFI screening. Prohibited revenues are well below the 5% threshold and interest-bearing debt is 12.5% of total assets (limit 33%).' },
  msft: { name: 'Microsoft Corp (MSFT)', sector: 'Technology', debtRatio: 9.8, interestIncomeRatio: 0.9, cashRatio: 15.4, status: 'Compliant', explanation: 'Microsoft Corp. passes AAOIFI screening. Debt-to-asset ratio is 9.8% (limit 33%) and liquidity ratios are within accepted thresholds.' },
  tsla: { name: 'Tesla Inc. (TSLA)', sector: 'Automotive / Clean Energy', debtRatio: 5.2, interestIncomeRatio: 0.5, cashRatio: 12.1, status: 'Compliant', explanation: 'Tesla is strictly compliant. Core activity is clean energy; debt ratio is a minimal 5.2%.' },
  nflx: { name: 'Netflix Inc. (NFLX)', sector: 'Entertainment / Media', debtRatio: 38.6, interestIncomeRatio: 0.2, cashRatio: 10.4, status: 'Non-Compliant', explanation: 'Netflix is non-compliant. Its debt-to-assets ratio is 38.6%, which violates the 33% maximum Shariah threshold.' },
  jpm: { name: 'JPMorgan Chase (JPM)', sector: 'Conventional Banking', debtRatio: 95.0, interestIncomeRatio: 85.0, cashRatio: 90.0, status: 'Non-Compliant', explanation: 'JPMorgan Chase is strictly prohibited (Haram) as its primary business activity fundamentally relies on interest-based financial services (Riba).' },
  dis: { name: 'Disney (DIS)', sector: 'Entertainment', debtRatio: 28.5, interestIncomeRatio: 4.8, cashRatio: 8.5, status: 'Doubtful', explanation: 'Disney is doubtful. While ratios are technically within limits, its media content and hospitality segments contain mixed revenues that require strict annual purification.' }
};

const logComplianceCheck = async (userId, details) => {
  try {
    await auditService.logAction(userId, 'complianceCheck', details);
  } catch (error) {
    console.error('Failed to log compliance check:', error.message);
  }
};

const buildComplianceResult = async (userId, status, payload, logDetails) => {
  await logComplianceCheck(userId, logDetails);
  return { success: true, status, ...payload };
};

const matchesRule = (rule, searchSector) => {
  const normalizedDescription = rule.description.toLowerCase();
  const normalizedSector = searchSector.toLowerCase();
  const firstKeyword = normalizedDescription.split(' ')[0];

  return normalizedSector.includes(firstKeyword) || normalizedDescription.includes(normalizedSector);
};

const checkCompliance = async ({ activityName, sector, userId }) => {
  if (!activityName && !sector) {
    const error = new Error('Stock Ticker or Sector is required to perform screening.');
    error.statusCode = 400;
    throw error;
  }

  const ticker = (activityName || '').toLowerCase().trim();
  const stock = SIMULATED_STOCKS[ticker];

  if (stock) {
    return buildComplianceResult(
      userId,
      stock.status,
      {
        activityName: stock.name,
        sector: stock.sector,
        explanation: stock.explanation,
        ratios: {
          debtRatio: stock.debtRatio,
          interestIncomeRatio: stock.interestIncomeRatio,
          cashRatio: stock.cashRatio
        }
      },
      `Screened Stock "${stock.name}" - Result: ${stock.status}`
    );
  }

  const searchSector = sector || 'general';
  const prohibitedResult = await db.query(`SELECT * FROM shariah_rules WHERE category = 'prohibited-sector'`);
  const matchedProhibited = prohibitedResult.rows.find((rule) => matchesRule(rule, searchSector));

  if (matchedProhibited) {
    return buildComplianceResult(
      userId,
      'Non-Compliant',
      {
        explanation: `The sector "${searchSector}" engages in strictly prohibited non-halal activities.`,
        ratios: { debtRatio: 75.0, interestIncomeRatio: 40.0, cashRatio: 25.0 },
        rule: { id: matchedProhibited.rule_id, description: matchedProhibited.description }
      },
      `Sector "${searchSector}" - Non-Compliant`
    );
  }

  const doubtfulResult = await db.query(`SELECT * FROM shariah_rules WHERE category = 'doubtful-sector'`);
  const matchedDoubtful = doubtfulResult.rows.find((rule) => matchesRule(rule, searchSector));

  if (matchedDoubtful) {
    return buildComplianceResult(
      userId,
      'Doubtful',
      {
        explanation: `The sector "${searchSector}" involves mixed revenues. Detailed purification is required.`,
        ratios: { debtRatio: 29.0, interestIncomeRatio: 4.5, cashRatio: 12.0 },
        rule: { id: matchedDoubtful.rule_id, description: matchedDoubtful.description }
      },
      `Sector "${searchSector}" - Doubtful`
    );
  }

  return buildComplianceResult(
    userId,
    'Compliant',
    {
      explanation: `The activity in the "${searchSector}" sector is permissible and Shariah-compliant. No violations detected.`,
      ratios: { debtRatio: 15.0, interestIncomeRatio: 2.1, cashRatio: 8.0 }
    },
    `Sector "${searchSector}" - Compliant`
  );
};

const getRules = async () => {
  const result = await db.query('SELECT * FROM shariah_rules ORDER BY category, rule_id');
  return result.rows;
};

module.exports = {
  checkCompliance,
  getRules
};
