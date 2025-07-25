const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  try {
    const { history, model: modelName, systemPrompt, enableWebSearch } = JSON.parse(event.body);
    
    if (!history || !Array.isArray(history)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No history provided' }) };
    }
    
    // Check if the model is a GitHub model or a Gemini model
    const isGitHubModel = modelName && modelName.startsWith('github-');
    
    if (isGitHubModel) {
      // GitHub Models API implementation
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      if (!GITHUB_TOKEN) {
        return { statusCode: 500, body: JSON.stringify({ error: 'GitHub API token not configured' }) };
      }
      
      // Extract the actual model name from the prefixed name (remove 'github-' prefix)
      const actualModelName = modelName.replace('github-', '');
      
      // Prepare messages for GitHub Models API
      const latestMessage = history.pop();
      let messages = [];
      
      // Add system prompt if provided
      if (systemPrompt && systemPrompt.trim()) {
        messages.push({
          role: 'system',
          content: systemPrompt.trim()
        });
      }
      
      // Convert history format to GitHub Models API format
      history.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.parts[0].text
        });
      });
      
      // Add the latest message
      messages.push({
        role: 'user',
        content: latestMessage.parts[0].text
      });
      
      try {
        // Call GitHub Models API
        const response = await axios.post(
          'https://models.github.ai/inference/chat/completions',
          {
            model: actualModelName,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4096
          },
          {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            reply: response.data.choices[0].message.content,
            groundingMetadata: null // GitHub Models doesn't provide grounding metadata in the same format
          })
        };
      } catch (error) {
        console.error("GitHub Models API error:", error.response?.data || error.message);
        
        // Improved error handling to prevent [object Object] errors
        let errorMessage;
        if (error.response?.data?.error) {
          // If error.response.data.error is an object, stringify it
          errorMessage = typeof error.response.data.error === 'object' 
            ? JSON.stringify(error.response.data.error) 
            : error.response.data.error;
        } else if (error.response?.data) {
          // If error.response.data is an object, stringify it
          errorMessage = typeof error.response.data === 'object' 
            ? JSON.stringify(error.response.data) 
            : error.response.data;
        } else {
          // Fallback to error message or a generic message
          errorMessage = error.message || 'An unknown error occurred with GitHub Models API';
        }
        
        return { 
          statusCode: 500, 
          body: JSON.stringify({ error: errorMessage }) 
        };
      }
    } else {
      // Original Gemini implementation
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
  } catch (error) {
    console.error("Function error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
