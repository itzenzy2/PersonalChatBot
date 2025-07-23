const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  try {
    const { history, model: modelName, systemPrompt, enableWebSearch } = JSON.parse(event.body);
    
    if (!history || !Array.isArray(history)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No history provided' }) };
    }
    
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // ▼▼▼ THE FIX IS HERE (from your research) ▼▼▼
    const modelConfig = { model: modelName || "gemini-1.5-flash" };

    // Add Google Search grounding if web search is enabled AND the model supports it
    if (enableWebSearch && (modelName === "gemini-1.5-pro" || modelName === "gemini-2.5-pro")) {
      modelConfig.tools = [{
        googleSearch: {}
      }];
    }
    // ▲▲▲ END OF FIX ▲▲▲
    
    const model = genAI.getGenerativeModel(modelConfig);

    const latestMessage = history.pop();
    let chatHistoryForApi = history;

    if (systemPrompt && systemPrompt.trim()) {
      chatHistoryForApi = [
        { role: 'user', parts: [{ text: systemPrompt.trim() }] },
        { role: 'model', parts: [{ text: 'I understand. I will follow these instructions for our conversation.' }] },
        ...chatHistoryForApi
      ];
    }

    const chat = model.startChat({ history: chatHistoryForApi });
    
    const result = await chat.sendMessage(latestMessage.parts);
    const response = result.response;
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: response.text(),
        groundingMetadata: groundingMetadata
      })
    };
  } catch (error) {
    console.error("Function error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
