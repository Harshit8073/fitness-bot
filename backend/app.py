import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing in environment variables.")

genai.configure(api_key=API_KEY)

# Use Gemini 2.5 Flash for chat responses
model = genai.GenerativeModel('gemini-2.5-flash')

app = Flask(__name__)
CORS(app) # Allow all domains for local development

SYSTEM_PROMPT = """
You are a knowledgeable, motivational, and friendly AI Fitness Coach.
Your goal is to help the user with their fitness journey, provide workout routines, diet plans, and general health advice.
Keep your responses concise, structured, and easy to read. Use formatting like bullet points or bold text where appropriate.
If a user asks about non-fitness related topics, politely steer the conversation back to health and wellness.
"""

# Store chat history in memory (for demonstration purposes)
chat_histories = {}

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')
    session_id = data.get('session_id', 'default')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        # Initialize chat session if it doesn't exist
        if session_id not in chat_histories:
            chat_histories[session_id] = model.start_chat(history=[
                {"role": "user", "parts": [SYSTEM_PROMPT]},
                {"role": "model", "parts": ["Understood! I'm ready to be your fitness coach. How can I help you today?"]}
            ])
            
        chat_session = chat_histories[session_id]
        
        # Send user message to Gemini
        response = chat_session.send_message(user_message)
        
        return jsonify({
            "response": response.text
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while communicating with the AI."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
