const db = require('../db');

const buildFinancialProfileContext = async (userId) => {
  if (!userId) return 'No financial profile available.';

  try {
    const profileRes = await db.query('SELECT * FROM financial_profiles WHERE user_id = $1', [userId]);
    if (profileRes.rows.length === 0) return 'No financial profile available.';

    const profile = profileRes.rows[0];
    return `User Financial Profile:\n- Monthly Income: $${profile.income || 0}\n- Total Assets: $${profile.assets || 0}\n- Total Liabilities: $${profile.liabilities || 0}\n- Current Savings: $${profile.savings || 0}\n`;
  } catch (error) {
    console.error('Error fetching profile for LLM context:', error.message);
    return 'No financial profile available.';
  }
};

const buildSystemInstruction = (userProfileText) => `You are ITQAN, a highly knowledgeable, compassionate, and professional AI Islamic Finance Advisor. Your primary directive is to help users manage their personal finances, analyze investments for Shariah compliance, calculate Zakat, and plan budgets strictly aligned with Islamic principles.

CRITICAL ISLAMIC PRINCIPLES:
1. Riba (Usury/Interest): Strictly prohibit any involvement in interest-bearing loans, conventional bonds, or high-yield savings accounts. Always suggest Halal alternatives like Sukuk, Musharaka, or Murabaha.
2. Gharar (Excessive Uncertainty) & Maysir (Gambling): Warn against options trading, excessive speculation, crypto day-trading, and conventional insurance (suggest Takaful instead).
3. Halal Sectors: Prohibit investments in alcohol, pork, gambling, adult entertainment, and conventional banking.

USER CONTEXT:
${userProfileText}

TONE:
Always speak with immense respect and professionalism. Use Islamic greetings like "Assalamu alaikum" when appropriate. Do not preach, but explain financial rules clearly and logically. Use bullet points and bold text to make your advice readable. Keep answers structured and actionable.`;

const buildContents = (message, history = []) => {
  const contents = Array.isArray(history)
    ? history.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }))
    : [];

  contents.push({ role: 'user', parts: [{ text: message }] });
  return contents;
};

const callGemini = async ({ message, history, systemInstructionText }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') return '';

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const geminiRes = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: buildContents(message, history),
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      }
    })
  });

  const geminiData = await geminiRes.json();
  const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    console.error('Gemini API Error:', JSON.stringify(geminiData, null, 2));
    throw new Error('Invalid Gemini API response structure');
  }

  return responseText;
};

const getFallbackResponse = (message) => {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('bond')) {
    return 'Assalamu alaikum. Standard conventional bonds involve guaranteed interest (Riba) which is strictly prohibited in Islam. Consider exploring **Sukuk** instead, which represents ownership in an underlying asset and shares both risk and reward.';
  }

  if (normalizedMessage.includes('zakat')) {
    return 'Assalamu alaikum. **Zakat** is calculated at 2.5% of your qualifying wealth held for a full lunar year (Hawl) once it exceeds the Nisab threshold.\n\nI recommend using the **Zakat Calculator** tool in the dashboard to get precise figures based on your current liquid assets and liabilities.';
  }

  if (normalizedMessage.includes('crypto') || normalizedMessage.includes('bitcoin')) {
    return 'Assalamu alaikum. Cryptocurrency is a debated topic among Islamic scholars. While the underlying blockchain technology is generally permissible, coins that lack utility, rely heavily on speculation (Gharar), or promise fixed returns (Riba) are strictly prohibited. Always look for crypto assets backed by tangible utility.';
  }

  return `Assalamu alaikum. I am the ITQAN AI Advisor. (Note: The LLM API key is currently missing or invalid, so I am running in fallback mode).\n\nTo provide a comprehensive Shariah-compliant response to your query regarding "${message}", remember to follow the core principles of avoiding Riba (interest), Gharar (uncertainty), and Maysir (gambling).`;
};

const storeAdvice = async (userId, responseText) => {
  if (!userId) return;

  try {
    await db.query(
      `INSERT INTO advice (user_id, advice_type, description)
       VALUES ($1, 'chatbot', $2)`,
      [userId, responseText]
    );
  } catch (error) {
    console.error('Failed to store advice in DB:', error.message);
  }
};

const generateChatReply = async ({ message, history, userId }) => {
  if (!message) {
    const error = new Error('Message is required.');
    error.statusCode = 400;
    throw error;
  }

  const userProfileText = await buildFinancialProfileContext(userId);
  const systemInstructionText = buildSystemInstruction(userProfileText);

  let responseText = '';
  try {
    responseText = await callGemini({ message, history, systemInstructionText });
  } catch (error) {
    console.error('Gemini API call failed, falling back to mock rules:', error.message);
  }

  if (!responseText) {
    responseText = getFallbackResponse(message);
  }

  await storeAdvice(userId, responseText);
  return { success: true, reply: responseText };
};

module.exports = {
  generateChatReply
};
