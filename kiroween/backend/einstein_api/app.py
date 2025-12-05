"""
Flask API for Albert Einstein AI Model using Hugging Face
Deploy this on Render.com for free hosting
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize model (lazy loading)
model = None
tokenizer = None
generator = None

def load_model():
    """Load Hugging Face model on first request"""
    global model, tokenizer, generator
    
    if model is None:
        print("Loading Einstein model...")
        
        # Use a free, fast model suitable for Einstein personality
        # Options: microsoft/DialoGPT-medium, gpt2, or a fine-tuned model
        model_name = os.getenv('HUGGINGFACE_MODEL', 'microsoft/DialoGPT-medium')
        
        try:
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(model_name)
            
            # Create text generation pipeline
            generator = pipeline(
                'text-generation',
                model=model,
                tokenizer=tokenizer,
                device=0 if torch.cuda.is_available() else -1
            )
            
            print(f"Model {model_name} loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            # Fallback to a smaller model
            model_name = 'gpt2'
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(model_name)
            generator = pipeline('text-generation', model=model, tokenizer=tokenizer)
            print(f"Using fallback model: {model_name}")

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/generate', methods=['POST'])
def generate():
    """Generate Einstein-style response"""
    try:
        data = request.json
        
        # Get input parameters
        question = data.get('question', '')
        conversation_history = data.get('history', [])
        max_length = data.get('max_length', 150)
        temperature = data.get('temperature', 0.7)
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        # Load model if not already loaded
        if model is None:
            load_model()
        
        # Build context from conversation history
        context = ""
        if conversation_history:
            # Format history as context
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                if role == 'user':
                    context += f"Human: {content}\n"
                else:
                    context += f"Einstein: {content}\n"
        
        # Create Einstein-style prompt
        einstein_prompt = f"""You are Albert Einstein, the brilliant theoretical physicist. 
You speak with wisdom, curiosity, and a touch of humor about science, mathematics, and the nature of reality.
You often use analogies and thought experiments to explain complex concepts simply.

{context}Human: {question}
Einstein:"""
        
        # Generate response
        result = generator(
            einstein_prompt,
            max_length=len(einstein_prompt.split()) + max_length,
            num_return_sequences=1,
            temperature=temperature,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # Extract generated text
        generated_text = result[0]['generated_text']
        
        # Extract only the Einstein response (after "Einstein:")
        if "Einstein:" in generated_text:
            response = generated_text.split("Einstein:")[-1].strip()
        else:
            response = generated_text.replace(einstein_prompt, "").strip()
        
        # Clean up response
        response = response.split('\n')[0]  # Take first line
        response = response[:500]  # Limit length
        
        return jsonify({
            'response': response,
            'model': os.getenv('HUGGINGFACE_MODEL', 'microsoft/DialoGPT-medium')
        })
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """API information"""
    return jsonify({
        'service': 'Einstein AI API',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/generate': 'POST - Generate Einstein response',
            '/': 'GET - API info'
        }
    })

if __name__ == '__main__':
    # Render.com sets PORT automatically - use it or default to 5000
    port = int(os.getenv('PORT', 5000))
    # Run on all interfaces (0.0.0.0) so Render can access it
    app.run(host='0.0.0.0', port=port, debug=False)

