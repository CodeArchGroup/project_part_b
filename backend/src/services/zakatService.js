const db = require('../db');
const {
  DEFAULT_GOLD_PRICE_PER_GRAM,
  GOLD_TROY_OUNCE_GRAMS,
  METALS_API_TIMEOUT_MS,
  NISAB_GOLD_GRAMS,
  ZAKAT_PERCENTAGE
} = require('../constants/shariah.constants');

const getGoldPricePerGram = async () => {
  let goldPricePerGram = DEFAULT_GOLD_PRICE_PER_GRAM;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), METALS_API_TIMEOUT_MS);
    const response = await fetch('https://api.metals.dev/v1/latest?base=USD&symbols=XAU', { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);

    if (response && response.ok) {
      const data = await response.json();
      if (data.rates && data.rates.XAU) {
        goldPricePerGram = Number(data.rates.XAU) / GOLD_TROY_OUNCE_GRAMS;
      }
    }
  } catch (error) {
    console.warn('Gold price lookup failed, using fallback price:', error.message);
  }

  return goldPricePerGram;
};

const calculateZakat = async ({ savings, gold, silver, investments, liabilities, userId }) => {
  const totalAssets = Number(savings || 0) + Number(gold || 0) + Number(silver || 0) + Number(investments || 0);
  const netWealth = totalAssets - Number(liabilities || 0);
  const goldPricePerGram = await getGoldPricePerGram();
  const nisabThreshold = goldPricePerGram * NISAB_GOLD_GRAMS;
  const eligible = netWealth >= nisabThreshold;
  const zakatDue = eligible ? netWealth * ZAKAT_PERCENTAGE : 0;

  if (userId) {
    try {
      await db.query(
        `INSERT INTO advice (user_id, advice_type, description)
         VALUES ($1, 'zakat', $2)`,
        [userId, `Zakat calculation: Net wealth = $${netWealth.toFixed(2)}, Zakat due = $${zakatDue.toFixed(2)}`]
      );
    } catch (error) {
      console.error('Failed to store zakat advice:', error.message);
    }
  }

  return {
    success: true,
    eligible,
    netWealth,
    zakatDue,
    message: eligible
      ? `You are eligible for Zakat. Your estimated Zakat is $${zakatDue.toFixed(2)}.`
      : 'Your net wealth is below the Nisab threshold. No Zakat is due.'
  };
};

module.exports = {
  calculateZakat
};
