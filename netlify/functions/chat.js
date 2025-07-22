const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  try {
    // ▼▼▼ NEW: RECEIVE BOTH HISTORY AND THE SELECTED MODEL ▼▼▼
    const { history, model: modelName } = JSON.parse(event.body);
    
    if (!history || !Array.isArray(history)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No history provided' }) };
    }
    
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // ▼▼▼ NEW: USE THE DYNAMIC MODEL NAME FROM THE FRONTEND ▼▼▼
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" }); // Fallback to flash

    // The user's latest message is the last one in the history array.
    const latestUserMessage = history.length > 0 ? history.pop().parts[0].text : "";
    const chatHistoryForApi = history;

    const chat = model.startChat({ history: chatHistoryForApi });
    const result = await chat.sendMessage(latestUserMessage);
    const response = result.response;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: response.text() })
    };
  } catch (error) {
    console.error("Function error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
