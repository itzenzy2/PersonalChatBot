import os, json
import google.generativeai as genai
API_KEY = os.environ.get('GEMINI_API_KEY')
def handler(event, context):
    if event['httpMethod'] != 'POST':
        return {'statusCode': 405, 'body': 'Method Not Allowed'}
    try:
        body = json.loads(event['body'])
        user_message = body.get('message')
        if not user_message:
            return {'statusCode': 400, 'body': json.dumps({'error': 'No message'})}
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(user_message)
        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'reply': response.text})
        }
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}