"""
AI Module Flask Server
Provides API endpoints for document summarization using Groq (FREE)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from summarizer import process_document
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins="*")

@app.route("/", methods=["GET"])
def home():
    """Home route"""
    return jsonify({
        "service": "Document AI Module",
        "version": "2.0.0",
        "status": "running",
        "endpoints": ["/health", "/api/summarize"]
    }), 200

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "OK",
        "service": "Document AI Module",
        "version": "2.0.0",
        "ai_enabled": bool(os.getenv("GROQ_API_KEY"))
    }), 200

@app.route("/api/summarize", methods=["POST"])
def summarize():
    """
    Endpoint to summarize a document using Groq
    """
    try:
        data = request.get_json()
        content = data.get("content", "")
        category = data.get("category", "other")
        
        print(f"Received request - content length: {len(content)}, category: {category}")
        print(f"GROQ_API_KEY present: {bool(os.getenv('GROQ_API_KEY'))}")
        
        if not content:
            return jsonify({"error": "Document content is required"}), 400
        
        result = process_document(content, category)
        print(f"Result: {result}")
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR: {error_trace}")
        return jsonify({"error": str(e), "trace": error_trace}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
