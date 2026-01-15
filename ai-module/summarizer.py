"""
Document Summarization Module - AI Powered
Uses Google Gemini API for intelligent document analysis
"""

import os
import re
import google.generativeai as genai
from typing import Dict

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def configure_gemini():
    """Configure the Gemini API"""
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        return True
    return False


def process_document(content: str, category: str = "other") -> Dict:
    """
    Process document using Google Gemini AI
    
    Args:
        content: Document text content
        category: Document category
        
    Returns:
        Dictionary with AI-generated summary, key points, actions, and scores
    """
    
    if not configure_gemini():
        return fallback_process(content, category)
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""Analyze this document and provide a structured analysis.

Document Category: {category}
Document Content:
{content[:8000]}

Please provide your analysis in EXACTLY this format (use these exact labels):

SUMMARY:
[Write a clear 2-3 sentence summary of the document]

KEY_POINTS:
- [Key point 1]
- [Key point 2]
- [Key point 3]
- [Key point 4]
- [Key point 5]

SUGGESTED_ACTIONS:
- [Action 1]
- [Action 2]
- [Action 3]

IMPORTANCE: [low/medium/high/critical]

READABILITY_SCORE: [number between 0-100]
"""
        
        response = model.generate_content(prompt)
        result_text = response.text
        
        # Parse the response
        parsed = parse_ai_response(result_text, category)
        return parsed
        
    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return fallback_process(content, category)


def parse_ai_response(response_text: str, category: str) -> Dict:
    """Parse the AI response into structured data"""
    
    result = {
        "summary": "",
        "key_points": [],
        "suggested_actions": [],
        "importance": "medium",
        "readability_score": 75
    }
    
    try:
        # Extract summary
        summary_match = re.search(r"SUMMARY:\s*\n(.*?)(?=\n\s*KEY_POINTS:|$)", response_text, re.DOTALL | re.IGNORECASE)
        if summary_match:
            result["summary"] = summary_match.group(1).strip()
        
        # Extract key points
        key_points_match = re.search(r"KEY_POINTS:\s*\n(.*?)(?=\n\s*SUGGESTED_ACTIONS:|$)", response_text, re.DOTALL | re.IGNORECASE)
        if key_points_match:
            points_text = key_points_match.group(1)
            points = re.findall(r"[-*]\s*(.+)", points_text)
            result["key_points"] = [p.strip() for p in points if p.strip()][:5]
        
        # Extract suggested actions
        actions_match = re.search(r"SUGGESTED_ACTIONS:\s*\n(.*?)(?=\n\s*IMPORTANCE:|$)", response_text, re.DOTALL | re.IGNORECASE)
        if actions_match:
            actions_text = actions_match.group(1)
            actions = re.findall(r"[-*]\s*(.+)", actions_text)
            result["suggested_actions"] = [a.strip() for a in actions if a.strip()][:3]
        
        # Extract importance
        importance_match = re.search(r"IMPORTANCE:\s*(low|medium|high|critical)", response_text, re.IGNORECASE)
        if importance_match:
            result["importance"] = importance_match.group(1).lower()
        
        # Extract readability score
        readability_match = re.search(r"READABILITY_SCORE:\s*(\d+)", response_text)
        if readability_match:
            score = int(readability_match.group(1))
            result["readability_score"] = min(100, max(0, score))
            
    except Exception as e:
        print(f"Parse error: {str(e)}")
    
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
    
    # Clean text
    text = re.sub(r"\s+", " ", content).strip()
    sentences = re.split(r"(?<=[.!?])\s+", text)
    clean_sentences = [s.strip() for s in sentences if len(s.split()) >= 5]
    
    # Generate basic summary
    summary = " ".join(clean_sentences[:3]) if clean_sentences else "Document uploaded for tracking."
    
    # Category-based actions
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
        "summary": summary[:500] if summary else f"This {category} document has been uploaded for tracking and management.",
        "key_points": clean_sentences[:5] if clean_sentences else ["Document stored for reference", "Review contents as needed"],
        "suggested_actions": actions_map.get(category, ["Review document", "Set reminders", "Store securely"]),
        "importance": "high" if category in ["license", "insurance", "contract", "identity"] else "medium",
        "readability_score": 75
    }
