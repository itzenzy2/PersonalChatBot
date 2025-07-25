const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure fetch is available (Node.js 18+ has it built-in, otherwise use node-fetch)
if (!global.fetch) {
  const fetch = require('node-fetch');
  global.fetch = fetch;
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  try {
    const { history, model: modelName, systemPrompt, enableWebSearch } = JSON.parse(event.body);
    
    if (!history || !Array.isArray(history)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No history provided' }) };
    }

    // Check if it's a GitHub Models API model (contains slash)
    if (modelName && modelName.includes('/')) {
      return await handleGitHubModel(history, modelName, systemPrompt, enableWebSearch);
    } else {
      return await handleGeminiModel(history, modelName, systemPrompt, enableWebSearch);
    }
  } catch (error) {
    console.error("Function error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};

async function handleGitHubModel(history, modelName, systemPrompt, enableWebSearch) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GitHub token not configured' }) };
  }

  // Convert chat history to GitHub Models format
  const messages = [];
  
  // Add system prompt if provided
  if (systemPrompt && systemPrompt.trim()) {
    messages.push({
      role: 'system',
      content: systemPrompt.trim()
    });
  }

  // Convert history to messages format
  for (const item of history) {
    if (item.role === 'user') {
      messages.push({
        role: 'user',
        content: item.parts[0].text || item.parts
      });
    } else if (item.role === 'model') {
      messages.push({
        role: 'assistant',
        content: item.parts[0].text || item.parts
      });
    }
  }

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2024-07-01-preview'
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub Models API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        reply: reply,
        groundingMetadata: null
      })
    };
  } catch (error) {
    console.error("GitHub Models API error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: `GitHub Models API error: ${error.message}` }) 
    };
  }
}

async function handleGeminiModel(history, modelName, systemPrompt, enableWebSearch) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  const modelConfig = { model: modelName || "gemini-1.5-flash" };

  // Add Google Search grounding if web search is enabled AND the model supports it
  // For Gemini 1.5 models (legacy tool)
  if (enableWebSearch && (modelName === "gemini-1.5-pro" || modelName === "gemini-1.5-flash")) {
    modelConfig.tools = [{
      googleSearchRetrieval: {}
    }];
  }
  // For Gemini 2.0+ models (current tool)
  else if (enableWebSearch && modelName === "gemini-2.5-pro") {
    modelConfig.tools = [{
      googleSearch: {}
    }];
  }
  
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
}
