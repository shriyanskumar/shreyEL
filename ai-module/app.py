"""
AI Module Flask Server
Provides API endpoints for document summarization using Groq (FREE)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from summarizer import process_document
from document_parser import extract_text_from_document
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
        "version": "3.0.0",
        "status": "running",
        "features": ["PDF text extraction", "Image OCR", "AI summarization"],
        "endpoints": ["/health", "/api/summarize"]
    }), 200

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "OK",
        "service": "Document AI Module",
        "version": "3.0.0",
        "ai_enabled": bool(os.getenv("GROQ_API_KEY"))
    }), 200

@app.route("/api/summarize", methods=["POST"])
def summarize():
    """
    Endpoint to summarize a document using Groq
    Accepts: content (text), fileUrl (PDF/image URL), category
    """
    try:
        data = request.get_json()
        content = data.get("content", "")
        file_url = data.get("fileUrl", "")
        category = data.get("category", "other")
        
        print(f"Received request - content length: {len(content)}, fileUrl: {file_url[:50] if file_url else 'None'}, category: {category}")
        print(f"GROQ_API_KEY present: {bool(os.getenv('GROQ_API_KEY'))}")
        
        # Extract text from file if URL provided
        extracted_text = ""
        if file_url:
            print("Extracting text from document file...")
            extracted_text = extract_text_from_document(file_url)
            print(f"Extracted {len(extracted_text)} characters from file")
        
        # Combine all content
        full_content = ""
        if content:
            full_content += f"Document Info:\n{content}\n\n"
        if extracted_text:
            full_content += f"Document Content:\n{extracted_text}"
        
        if not full_content.strip():
            return jsonify({"error": "No document content available"}), 400
        
        print(f"Total content length: {len(full_content)}")
        
        result = process_document(full_content, category)
        print(f"Result summary: {result.get('summary', '')[:100]}...")
        return jsonify(result), 200
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR: {error_trace}")
        return jsonify({"error": str(e), "trace": error_trace}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
