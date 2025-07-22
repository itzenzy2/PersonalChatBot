const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  try {
    const { history, model: modelName } = JSON.parse(event.body);
    
    if (!history || !Array.isArray(history)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No history provided' }) };
    }
    
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

    const latestMessage = history.pop();
    const chatHistoryForApi = history;

    const chat = model.startChat({ history: chatHistoryForApi });
    
    // ▼▼▼ REVERTED TO THE STABLE, NON-STREAMING CALL ▼▼▼
    const result = await chat.sendMessage(latestMessage.parts);
    const response = result.response;
    
    // ▼▼▼ REVERTED TO RETURNING A SIMPLE JSON OBJECT ▼▼▼
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: response.text() })
    };
  } catch (error) {
    console.error("Function error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
