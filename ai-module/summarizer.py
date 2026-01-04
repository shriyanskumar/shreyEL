"""
Document Summarization Module
Provides functions for text extraction, summarization, and analysis
"""

import re
from typing import List, Dict, Tuple

class DocumentProcessor:
    """
    Core document processing class for summarization and key point extraction
    """
    
    def __init__(self):
        self.min_sentence_length = 5
        self.max_summary_sentences = 5
    
    def extract_text(self, content: str) -> str:
        """
        Clean and extract text from document content
        
        Args:
            content: Raw document text
            
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', content)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\-\:\;]', '', text)
        return text.strip()
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if len(s.strip().split()) >= self.min_sentence_length]
    
    def extract_key_points(self, text: str, num_points: int = 5) -> List[str]:
        """
        Extract key points from text (extractive approach)
        
        Args:
            text: Input text
            num_points: Number of key points to extract
            
        Returns:
            List of key points
        """
        sentences = self.split_into_sentences(text)
        # Return first num_points sentences as key points
        return sentences[:min(num_points, len(sentences))]
    
    def generate_summary(self, text: str) -> str:
        """
        Generate summary of text
        
        Args:
            text: Input text
            
        Returns:
            Summary text
        """
        sentences = self.split_into_sentences(text)
        if not sentences:
            return "Unable to generate summary from provided text."
        
        summary_sentences = sentences[:self.max_summary_sentences]
        return ' '.join(summary_sentences)
    
    def suggest_actions(self, text: str, doc_category: str) -> List[str]:
        """
        Generate suggested actions based on document category
        
        Args:
            text: Document text
            doc_category: Document category (license, certificate, etc.)
            
        Returns:
            List of suggested actions
        """
        actions = {
            'license': [
                'Review expiration date',
                'Schedule renewal appointment',
                'Gather required documents for renewal',
                'Check for any updates in requirements'
            ],
            'certificate': [
                'Verify validity and authenticity',
                'Check for renewal requirements',
                'Update records if necessary'
            ],
            'insurance': [
                'Review coverage details',
                'Check for upcoming renewal dates',
                'Verify all coverage is current'
            ],
            'contract': [
                'Review contract terms',
                'Check for renewal clauses',
                'Note key dates and obligations'
            ]
        }
        return actions.get(doc_category, ['Review document carefully', 'Store safely', 'Check expiration dates'])


class TextAnalyzer:
    """
    Advanced text analysis for readability and importance scoring
    """
    
    @staticmethod
    def calculate_readability_score(text: str) -> float:
        """
        Calculate basic readability score (0-100)
        
        Args:
            text: Input text
            
        Returns:
            Readability score
        """
        if not text:
            return 0
        
        words = text.split()
        sentences = len(re.split(r'[.!?]+', text))
        
        avg_word_length = sum(len(w) for w in words) / len(words) if words else 0
        avg_sentence_length = len(words) / sentences if sentences > 0 else 0
        
        # Flesch Kincaid Grade Level approximation
        score = 0.39 * avg_sentence_length + 11.8 * (avg_word_length / 5) - 15.59
        return max(0, min(100, score))
    
    @staticmethod
    def assess_importance(text: str) -> str:
        """
        Assess document importance based on content analysis
        
        Args:
            text: Input text
            
        Returns:
            Importance level: 'low', 'medium', 'high', 'critical'
        """
        important_keywords = {
            'critical': ['urgent', 'immediate', 'critical', 'expired', 'penalty', 'violation'],
            'high': ['important', 'required', 'mandatory', 'deadline', 'expiration'],
            'medium': ['review', 'necessary', 'recommended', 'update'],
            'low': ['optional', 'information', 'reference', 'archive']
        }
        
        text_lower = text.lower()
        
        for level, keywords in important_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return level
        
        return 'medium'


# Initialize processor
processor = DocumentProcessor()
analyzer = TextAnalyzer()


def process_document(content: str, category: str = 'other') -> Dict:
    """
    Main function to process a document and generate all analysis
    
    Args:
        content: Document text content
        category: Document category
        
    Returns:
        Dictionary with summary, key points, actions, and scores
    """
    cleaned_text = processor.extract_text(content)
    
    return {
        'summary': processor.generate_summary(cleaned_text),
        'key_points': processor.extract_key_points(cleaned_text),
        'suggested_actions': processor.suggest_actions(cleaned_text, category),
        'readability_score': analyzer.calculate_readability_score(cleaned_text),
        'importance': analyzer.assess_importance(cleaned_text)
    }
