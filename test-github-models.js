// Test script for GitHub Models API integration
// To run: node test-github-models.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure fetch is available (Node.js 18+ has it built-in, otherwise use node-fetch)
if (!global.fetch) {
  const fetch = require('node-fetch');
  global.fetch = fetch;
}

async function testGitHubModelsAPI() {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN) {
    console.log('❌ GITHUB_TOKEN environment variable not set');
    console.log('Please set your GitHub token: export GITHUB_TOKEN=your_token_here');
    return;
  }

  console.log('🧪 Testing GitHub Models API...');
  
  try {
    // Test with a simple model
    const testModel = 'microsoft/phi-4-mini-instruct';
    const messages = [
      {
        role: 'user',
        content: 'Hello! Can you tell me what model you are?'
      }
    ];

    console.log(`📡 Testing model: ${testModel}`);
    
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2024-07-01-preview'
      },
      body: JSON.stringify({
        model: testModel,
        messages: messages,
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    
    console.log('✅ Success! GitHub Models API is working');
    console.log('📝 Response:', reply);
    
  } catch (error) {
    console.error('❌ Error testing GitHub Models API:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 This might be a token permission issue. Make sure your GitHub token has "models:read" permissions.');
    }
  }
}

// Also test Gemini integration
async function testGeminiAPI() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.log('❌ GEMINI_API_KEY environment variable not set');
    return;
  }

  console.log('🧪 Testing Gemini API...');
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Hello! This is a test.");
    const response = result.response;
    
    console.log('✅ Success! Gemini API is working');
    console.log('📝 Response:', response.text().substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API integration tests...\n');
  
  await testGitHubModelsAPI();
  console.log('');
  await testGeminiAPI();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. If tests pass, deploy your changes to Netlify');
  console.log('2. Set the GITHUB_TOKEN environment variable in Netlify dashboard');
  console.log('3. Test the new models in your chatbot interface');
}

runTests();