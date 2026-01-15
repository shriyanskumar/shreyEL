"""
Document Summarization Module - AI Powered
Uses Groq API (FREE) for intelligent document analysis
"""

import os
import re
import json
from groq import Groq
from typing import Dict

# Configure Groq (FREE API)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_groq_client():
    """Get Groq client"""
    if GROQ_API_KEY:
        return Groq(api_key=GROQ_API_KEY)
    return None


def process_document(content: str, category: str = "other") -> Dict:
    """
    Process document using Groq (FREE Llama model)
    """
    
    client = get_groq_client()
    if not client:
        print("No GROQ_API_KEY found, using fallback")
        return fallback_process(content, category)
    
    try:
        prompt = f"""Analyze this document and provide a structured analysis.

Document Category: {category}
Document Content:
{content[:6000]}

Respond with a JSON object in this exact format:
{{
    "summary": "A clear 2-3 sentence summary of the document",
    "key_points": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
    "suggested_actions": ["Action 1", "Action 2", "Action 3"],
    "importance": "low or medium or high or critical",
    "readability_score": 75
}}

Only respond with valid JSON, no other text."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a document analysis assistant. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        result_text = response.choices[0].message.content.strip()
        print(f"Groq response: {result_text[:200]}")
        
        # Parse JSON response
        parsed = parse_json_response(result_text, category)
        return parsed
        
    except Exception as e:
        print(f"Groq API error: {str(e)}")
        return fallback_process(content, category)


def parse_json_response(response_text: str, category: str) -> Dict:
    """Parse the JSON response"""
    
    result = {
        "summary": "",
        "key_points": [],
        "suggested_actions": [],
        "importance": "medium",
        "readability_score": 75
    }
    
    try:
        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            data = json.loads(json_match.group())
            
            result["summary"] = data.get("summary", "")
            result["key_points"] = data.get("key_points", [])[:5]
            result["suggested_actions"] = data.get("suggested_actions", [])[:3]
            result["importance"] = data.get("importance", "medium").lower()
            result["readability_score"] = min(100, max(0, int(data.get("readability_score", 75))))
            
    except Exception as e:
        print(f"JSON parse error: {str(e)}")
    
    # Ensure we have default values
    if not result["summary"]:
        result["summary"] = "Document analyzed successfully."
    if not result["key_points"]:
        result["key_points"] = ["Review document contents", "Note important dates", "Store securely"]
    if not result["suggested_actions"]:
        result["suggested_actions"] = ["Review document", "Set reminders for key dates", "Keep backup copy"]
    
    return result


def fallback_process(content: str, category: str) -> Dict:
    """Fallback processing when AI is not available"""
    
    text = re.sub(r"\s+", " ", content).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    clean_sentences = [s.strip() for s in sentences if len(s.split()) >= 5]
    
    summary = " ".join(clean_sentences[:3]) if clean_sentences else "Document uploaded for tracking."
    
    actions_map = {
        "license": ["Check expiration date", "Plan for renewal", "Keep accessible"],
        "certificate": ["Verify authenticity", "Store securely", "Track validity"],
        "insurance": ["Review coverage", "Note premium dates", "Update if needed"],
        "contract": ["Review terms", "Note deadlines", "Keep signed copy"],
        "tax": ["Keep for 7 years", "Organize by year", "Consult tax advisor"],
        "permit": ["Track expiry", "Note conditions", "Keep for inspections"],
        "identity": ["Check expiration", "Renew early", "Keep secure copy"]
    }
    
    return {
        "summary": summary[:500] if summary else f"This {category} document has been uploaded for tracking.",
        "key_points": clean_sentences[:5] if clean_sentences else ["Document stored for reference"],
        "suggested_actions": actions_map.get(category, ["Review document", "Set reminders"]),
        "importance": "high" if category in ["license", "insurance", "contract", "identity"] else "medium",
        "readability_score": 75
    }
