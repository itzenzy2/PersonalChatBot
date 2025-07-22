const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }
  
  try {
    // Get the history from the request body
    const { history } = JSON.parse(event.body);
    
    // Validate the history
    if (!history || !Array.isArray(history) || history.length === 0) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'No history provided' }) 
      };
    }
    
    // Configure Gemini API
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: 'API key not configured' }) 
      };
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The user's latest message is the last one in the history array.
    // We separate it from the rest of the history for the API call.
    const latestUserMessage = history.pop().parts[0].text; // Get the user's prompt text
    const chatHistoryForApi = history; // The rest of the array is the history

    // Start a chat session with the previous history
    const chat = model.startChat({
      history: chatHistoryForApi,
    });

    // Send the user's new message
    const result = await chat.sendMessage(latestUserMessage);
    const response = result.response;
    
    // Return successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
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
