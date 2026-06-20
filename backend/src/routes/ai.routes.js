const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * POST /api/ai/chat
 * AI chatbot endpoint. Uses Gemini 2.5 Flash to provide Shariah-compliant financial advice.
 * Persists the advice record in PostgreSQL.
 */
router.post('/chat', authMiddleware, async (req, res) => {
  const { message, history, userId } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }

  // Fetch the user's financial profile from PostgreSQL to provide context to the LLM
  let userProfileText = "No financial profile available.";
  if (userId) {
    try {
      const profileRes = await db.query('SELECT * FROM financial_profiles WHERE user_id = $1', [userId]);
      if (profileRes.rows.length > 0) {
        const p = profileRes.rows[0];
        userProfileText = `User Financial Profile:\n- Monthly Income: $${p.income || 0}\n- Total Assets: $${p.assets || 0}\n- Total Liabilities: $${p.liabilities || 0}\n- Current Savings: $${p.savings || 0}\n`;
      }
    } catch (err) {
      console.error("Error fetching profile for LLM context:", err.message);
    }
  }

  const systemInstructionText = `You are ITQAN, a highly knowledgeable, compassionate, and professional AI Islamic Finance Advisor. Your primary directive is to help users manage their personal finances, analyze investments for Shariah compliance, calculate Zakat, and plan budgets strictly aligned with Islamic principles. 
  
CRITICAL ISLAMIC PRINCIPLES:
1. Riba (Usury/Interest): Strictly prohibit any involvement in interest-bearing loans, conventional bonds, or high-yield savings accounts. Always suggest Halal alternatives like Sukuk, Musharaka, or Murabaha.
2. Gharar (Excessive Uncertainty) & Maysir (Gambling): Warn against options trading, excessive speculation, crypto day-trading, and conventional insurance (suggest Takaful instead).
3. Halal Sectors: Prohibit investments in alcohol, pork, gambling, adult entertainment, and conventional banking.
  
USER CONTEXT:
${userProfileText}

TONE:
Always speak with immense respect and professionalism. Use Islamic greetings like "Assalamu alaikum" when appropriate. Do not preach, but explain financial rules clearly and logically. Use bullet points and bold text to make your advice readable. Keep answers structured and actionable.`;

  let responseText = "";
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_api_key_here') {
    try {
      const contents = [];
      if (history && Array.isArray(history)) {
        history.forEach(msg => {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstructionText }]
          }
        })
      });

      const geminiData = await geminiRes.json();
      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts[0]?.text) {
        responseText = geminiData.candidates[0].content.parts[0].text;
      } else {
        console.error("Gemini API Error:", JSON.stringify(geminiData, null, 2));
        throw new Error('Invalid Gemini API response structure');
      }
    } catch (error) {
      console.error('Gemini API call failed, falling back to mock rules:', error.message);
    }
  }

  // Fallback engine if Gemini is not configured or fails
  if (!responseText) {
    // Artificial delay to simulate thinking
    await new Promise(resolve => setTimeout(resolve, 800));

    responseText = "Assalamu alaikum. I am the ITQAN AI Advisor. (Note: The LLM API key is currently missing or invalid, so I am running in fallback mode).\n\nTo provide a comprehensive Shariah-compliant response to your query regarding '" + message + "', remember to follow the core principles of avoiding Riba (interest), Gharar (uncertainty), and Maysir (gambling).";

    if (message.toLowerCase().includes('bond')) {
      responseText = "Assalamu alaikum. Standard conventional bonds involve guaranteed interest (Riba) which is strictly prohibited in Islam. Consider exploring **Sukuk** instead, which represents ownership in an underlying asset and shares both risk and reward.";
    } else if (message.toLowerCase().includes('zakat')) {
      responseText = "Assalamu alaikum. **Zakat** is calculated at 2.5% of your qualifying wealth held for a full lunar year (Hawl) once it exceeds the Nisab threshold.\n\nI recommend using the **Zakat Calculator** tool in the dashboard to get precise figures based on your current liquid assets and liabilities.";
    } else if (message.toLowerCase().includes('crypto') || message.toLowerCase().includes('bitcoin')) {
      responseText = "Assalamu alaikum. Cryptocurrency is a debated topic among Islamic scholars. While the underlying blockchain technology is generally permissible, coins that lack utility, rely heavily on speculation (Gharar), or promise fixed returns (Riba) are strictly prohibited. Always look for crypto assets backed by tangible utility.";
    }
  }

  // Store the generated advice in PostgreSQL for auditing
  if (userId) {
    try {
      await db.query(
        `INSERT INTO advice (user_id, advice_type, description)
         VALUES ($1, 'chatbot', $2)`,
        [userId, responseText]
      );
    } catch (error) {
      console.error('Failed to store advice in DB:', error.message);
    }
  }

  res.json({ success: true, reply: responseText });
});

module.exports = router;
