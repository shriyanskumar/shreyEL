"""
AI Module Flask Server
Provides API endpoints for document summarization and analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from summarizer import process_document
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Document AI Module',
        'version': '1.0.0'
    }), 200

@app.route('/api/summarize', methods=['POST'])
def summarize():
    """
    Endpoint to summarize a document
    
    Request body:
    {
        "content": "document text",
        "category": "license" | "certificate" | "permit" | "insurance" | "contract" | "other"
    }
    """
    try:
        data = request.get_json()
        content = data.get('content', '')
        category = data.get('category', 'other')
        
        if not content:
            return jsonify({'error': 'Document content is required'}), 400
        
        result = process_document(content, category)
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract-key-points', methods=['POST'])
def extract_key_points():
    """
    Endpoint to extract key points from document
    
    Request body:
    {
        "content": "document text",
        "num_points": 5
    }
    """
    try:
        data = request.get_json()
        content = data.get('content', '')
        num_points = data.get('num_points', 5)
        
        if not content:
            return jsonify({'error': 'Document content is required'}), 400
        
        from summarizer import processor
        cleaned_text = processor.extract_text(content)
        key_points = processor.extract_key_points(cleaned_text, num_points)
        
        return jsonify({'key_points': key_points}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    """
    Endpoint to analyze text readability and importance
    
    Request body:
    {
        "content": "document text"
    }
    """
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if not content:
            return jsonify({'error': 'Document content is required'}), 400
        
        from summarizer import analyzer
        readability = analyzer.calculate_readability_score(content)
        importance = analyzer.assess_importance(content)
        
        return jsonify({
            'readability_score': readability,
            'importance': importance
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('AI_SERVICE_PORT', 5001))
    app.run(debug=os.getenv('FLASK_ENV', 'development') == 'development', port=port)
