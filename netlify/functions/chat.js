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
    
    // ▼▼▼ CORE CHANGE: USE generateContentStream ▼▼▼
    const result = await chat.sendMessageStream(latestMessage.parts);

    // Use a modern ReadableStream to pipe the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of result.stream) {
          const text = chunk.text();
          // Enqueue the text chunk, encoded as UTF-8
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      }
    });

    // Return the stream directly
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });

  } catch (error) {
    console.error("Function error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
