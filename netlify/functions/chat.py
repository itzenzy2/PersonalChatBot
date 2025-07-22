import os
import json
import google.generativeai as genai

def handler(event, context):
    """
    Netlify function handler for Gemini chatbot
    """
    # Check if request method is POST
    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method Not Allowed'})
        }
    
    try:
        # Parse request body
        body = json.loads(event['body'])
        user_message = body.get('message')
        
        # Validate input
        if not user_message:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No message provided'})
            }
        
        # Configure and use Gemini API
        API_KEY = os.environ.get('GEMINI_API_KEY')
        if not API_KEY:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'API key not configured'})
            }
            
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(user_message)
        
        # Return successful response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # For CORS support
            },
            'body': json.dumps({'reply': response.text})
        }
    except Exception as e:
        # Handle errors
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
