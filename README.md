# Personal Chat Bot

A simple, customizable chat interface for Google's Gemini AI models and GitHub Models, deployable on Netlify.

## Features

- Chat with multiple AI models:
  - Google Gemini models (1.5 Pro, 2.5 Pro, 1.5 Flash)
  - GitHub Models (Llama 3.1, Mistral Large 2, GPT-4.1)
- Web search capability (Gemini models only)
- System prompt customization
- File attachment support
- Auto-save conversations
- Copy and regenerate responses
- Markdown and code syntax highlighting
- Mobile-responsive design

## Setup

### Prerequisites

- Node.js and npm installed
- Google AI Studio API key for Gemini models
- GitHub token for GitHub Models API access

### Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   cd netlify/functions
   npm install
   ```

### Configuration

1. Create a `.env` file in the `netlify/functions` directory with your API keys:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   GITHUB_TOKEN=your_github_token_here
   ```

2. Deploy to Netlify or run locally using Netlify CLI:
   ```
   npm install -g netlify-cli
   netlify dev
   ```

## Deployment

This project is designed to be deployed on Netlify. Connect your repository to Netlify and set the environment variables in the Netlify dashboard.

## License

MIT