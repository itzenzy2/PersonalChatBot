# Adding GitHub Models to Your Chatbot

## Setup Instructions

### 1. Get a GitHub Personal Access Token

To use GitHub Models, you need a GitHub Personal Access Token with `models:read` permissions:

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" > "Generate new token (classic)"
3. Give it a descriptive name like "Chatbot GitHub Models"
4. Select the following permissions:
   - `models:read` - Required for accessing GitHub Models API
5. Click "Generate token"
6. **Important**: Copy the token immediately - you won't be able to see it again

### 2. Configure Environment Variables

#### For Netlify Deployment:
1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add the following environment variable:
   - Key: `GITHUB_TOKEN`
   - Value: Your GitHub Personal Access Token

#### For Local Development:
Create a `.env` file in your project root:
```
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
```

### 3. Available Models

The chatbot now supports these GitHub Marketplace models:

#### OpenAI Models:
- `openai/gpt-4.1` - Latest GPT model with enhanced capabilities
- `openai/gpt-4o` - Advanced multimodal model (text, image, audio)
- `openai/gpt-4o-mini` - Efficient version of GPT-4o
- `openai/o1` - Advanced reasoning model
- `openai/o3` - Latest reasoning model with safety improvements

#### Cohere Models:
- `cohere/cohere-command-r-plus-08-2024` - State-of-the-art RAG-optimized model
- `cohere/cohere-command-r-08-2024` - Scalable generative model for RAG and Tool Use

#### Meta Models:
- `meta/llama-4-scout-17b-16e-instruct` - Great for multi-document summarization
- `meta/llama-3.3-70b-instruct` - Enhanced reasoning capabilities
- `meta/llama-3.2-90b-vision-instruct` - Advanced image reasoning

#### Microsoft Models:
- `microsoft/phi-4` - High capability, low latency model
- `microsoft/phi-4-reasoning` - Specialized reasoning model
- `microsoft/phi-4-multimodal-instruct` - Multimodal with text, audio, image support

#### DeepSeek Models:
- `deepseek/deepseek-r1` - Excellent at reasoning tasks and coding
- `deepseek/deepseek-v3-0324` - Enhanced reasoning and function calling

#### Mistral AI Models:
- `mistral-ai/mistral-large-2411` - Enhanced reasoning and function calling
- `mistral-ai/mistral-medium-2505` - Advanced LLM with vision capabilities

#### xAI Models:
- `xai/grok-3` - Designed to excel in specialized domains
- `xai/grok-3-mini` - Lightweight reasoning model

### 4. Rate Limits

GitHub Models has different rate limits based on your plan:
- **Copilot Free**: 15 requests/minute, 150 requests/day
- **Copilot Pro**: Higher limits
- **Copilot Business/Enterprise**: Even higher limits

### 5. Features by Model

- **Multimodal**: Models like GPT-4o and Llama Vision can process images
- **Reasoning**: Models like o1, o3, DeepSeek-R1, and Phi-4-Reasoning excel at complex problem-solving
- **Code Generation**: Models like Codestral and DeepSeek are optimized for coding tasks
- **Long Context**: Many models support 128K+ tokens for long conversations

### 6. Testing

After setup:
1. Deploy your changes to Netlify
2. Try selecting different models from the dropdown
3. Test with various types of prompts to see how different models perform

### 7. Troubleshooting

**Common Issues:**
- `GitHub token not configured`: Make sure GITHUB_TOKEN is set in environment variables
- `API error 401`: Check that your GitHub token has `models:read` permissions
- `Rate limit exceeded`: Wait for the rate limit to reset or upgrade your GitHub plan

**Model Selection Tips:**
- For reasoning tasks: Use o1, o3, DeepSeek-R1, or Phi-4-Reasoning
- For multimodal tasks: Use GPT-4o, Llama Vision, or Phi-4-Multimodal
- For efficient general use: Use GPT-4o-mini, Phi-4, or Gemini Flash
- For coding: Use DeepSeek models or Codestral