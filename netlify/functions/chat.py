import os, json
import google.generativeai as genai

API_KEY = os.environ.get('GEMINI_API_KEY')

def handler(event, context):
    # CORS headers for all responses
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
    
    # Handle preflight OPTIONS request
    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Only allow POST requests
    if event['httpMethod'] != 'POST':
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method Not Allowed'})
        }
    
    try:
        # Parse request body first
        body = json.loads(event['body'])
        user_message = body.get('message')
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No message provided'})
            }
        
        # Check if API key is configured after validating input
        if not API_KEY:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'GEMINI_API_KEY not configured'})
            }
        
        # Configure and call Gemini API
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(user_message)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'reply': response.text})
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }