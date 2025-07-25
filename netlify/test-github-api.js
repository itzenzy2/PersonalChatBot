const axios = require('axios');

async function testGitHubModelsAPI() {
  try {
    const response = await axios.post(
      'https://models.github.ai/inference/chat/completions',
      {
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        max_tokens: 4096
      },
      {
        headers: {
          'Authorization': 'Bearer test_token',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error object:', error.name);
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGitHubModelsAPI();