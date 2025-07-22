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
    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const userMessage = body.message;
    
    // Validate the message
    if (!userMessage) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'No message provided' }) 
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
    
    // Initialize the Gemini AI client
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Generate content from the model
    const result = await model.generateContent(userMessage);
    const response = result.response;
    
    // Return successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'  // For CORS support
      },
      body: JSON.stringify({ reply: response.text() })
    };
  } catch (error) {
    // Handle any errors
    console.error("Function error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
