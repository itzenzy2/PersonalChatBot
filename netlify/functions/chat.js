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
    
    // Configure model with optional tools for web search
    const modelConfig = { model: modelName || "gemini-1.5-flash" };
    
    // Add Google Search grounding if web search is enabled
    // Note: This tool works best with specific models like 1.5 Pro.
    if (enableWebSearch) {
      modelConfig.tools = [{
        'googleSearchRetrieval': {}
      }];
    }
    
    const model = genAI.getGenerativeModel(modelConfig);

    const latestMessage = history.pop();
    let chatHistoryForApi = history;

    // If system prompt is provided, prepend it to the conversation history
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
    
    // Extract grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: response.text(),
        groundingMetadata: groundingMetadata // Include grounding sources
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
