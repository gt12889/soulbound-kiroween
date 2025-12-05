"""
Simpler Flask API using Hugging Face Inference API (no model download needed!)
This version is faster and uses less memory - perfect for Render free tier
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)

# Hugging Face API endpoint
HF_API_URL = "https://api-inference.huggingface.co/models"
HF_API_KEY = os.getenv('HUGGINGFACE_API_KEY', '')
MODEL_NAME = os.getenv('HUGGINGFACE_MODEL', 'microsoft/DialoGPT-medium')

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_NAME,
        'api_type': 'inference_api'
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate Einstein-style response using Hugging Face Inference API"""
    try:
        data = request.json
        
        question = data.get('question', '')
        conversation_history = data.get('history', [])
        max_length = data.get('max_length', 100)
        temperature = data.get('temperature', 0.7)
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        if not HF_API_KEY:
            return jsonify({'error': 'HUGGINGFACE_API_KEY not set'}), 500
        
        # Build context from conversation history
        context = ""
        if conversation_history:
            for msg in conversation_history[-5:]:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    context += f"Human: {content}\n"
                else:
                    context += f"Einstein: {content}\n"
        
        # Create Einstein-style prompt
        prompt = f"""You are Albert Einstein, the brilliant theoretical physicist. 
You speak with wisdom, curiosity, and a touch of humor about science, mathematics, and the nature of reality.
You often use analogies and thought experiments to explain complex concepts simply.

{context}Human: {question}
Einstein:"""
        
        # Call Hugging Face Inference API
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_length,
                "temperature": temperature,
                "return_full_text": False
            }
        }
        
        response = requests.post(
            f"{HF_API_URL}/{MODEL_NAME}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            error_msg = response.json().get('error', 'Unknown error')
            return jsonify({'error': f'Hugging Face API error: {error_msg}'}), 500
        
        result = response.json()
        
        # Extract generated text
        if isinstance(result, list) and len(result) > 0:
            generated_text = result[0].get('generated_text', '')
        elif isinstance(result, dict):
            generated_text = result.get('generated_text', '')
        else:
            generated_text = str(result)
        
        # Clean up response
        response_text = generated_text.strip()
        response_text = response_text.split('\n')[0]  # Take first line
        response_text = response_text[:500]  # Limit length
        
        return jsonify({
            'response': response_text,
            'model': MODEL_NAME
        })
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout - model may be loading'}), 504
    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """API information"""
    return jsonify({
        'service': 'Einstein AI API (Inference API)',
        'version': '1.0.0',
        'model': MODEL_NAME,
        'endpoints': {
            '/health': 'GET - Health check',
            '/generate': 'POST - Generate Einstein response',
            '/': 'GET - API info'
        }
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

