"""
Document Parser Module
Extracts text from PDFs and images
"""

import io
import requests
from typing import Optional
from urllib.parse import urlparse

# PDF parsing
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("PyPDF2 not available")


def download_file(url: str) -> Optional[bytes]:
    """Download file from URL"""
    try:
        print(f"Downloading file from: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        print(f"Downloaded {len(response.content)} bytes")
        return response.content
    except Exception as e:
        print(f"Download error: {str(e)}")
        return None


def get_file_extension(url: str, content_type: str = "") -> str:
    """Get file extension from URL or content-type"""
    parsed = urlparse(url)
    path = parsed.path.lower()
    
    # Check URL path
    if '.pdf' in path:
        return 'pdf'
    elif any(ext in path for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']):
        return 'image'
    
    # Check content-type if provided
    if 'pdf' in content_type.lower():
        return 'pdf'
    elif 'image' in content_type.lower():
        return 'image'
    
    # For Cloudinary and other URLs without extension, try both
    return 'unknown'


def download_file_with_type(url: str) -> tuple:
    """Download file and return (bytes, content_type)"""
    try:
        print(f"Downloading file from: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        content_type = response.headers.get('Content-Type', '')
        print(f"Downloaded {len(response.content)} bytes, Content-Type: {content_type}")
        return response.content, content_type
    except Exception as e:
        print(f"Download error: {str(e)}")
        return None, ""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF bytes"""
    if not PDF_AVAILABLE:
        return ""
    
    try:
        pdf_file = io.BytesIO(file_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text_parts = []
        for page_num, page in enumerate(pdf_reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"[Page {page_num + 1}]\n{page_text}")
        
        full_text = "\n\n".join(text_parts)
        print(f"Extracted {len(full_text)} characters from PDF ({len(pdf_reader.pages)} pages)")
        return full_text
        
    except Exception as e:
        print(f"PDF extraction error: {str(e)}")
        return ""


def extract_text_from_image_ocr_api(file_bytes: bytes) -> str:
    """Extract text from image using free OCR.space API"""
    try:
        # Free OCR API (no key needed for basic usage)
        url = "https://api.ocr.space/parse/image"
        
        response = requests.post(
            url,
            files={"file": ("image.png", file_bytes)},
            data={"apikey": "helloworld", "language": "eng"},  # Free API key
            timeout=60
        )
        
        result = response.json()
        
        if result.get("IsErroredOnProcessing"):
            print(f"OCR API error: {result.get('ErrorMessage')}")
            return ""
        
        parsed_results = result.get("ParsedResults", [])
        if parsed_results:
            text = parsed_results[0].get("ParsedText", "")
            print(f"OCR extracted {len(text)} characters")
            return text
        
        return ""
        
    except Exception as e:
        print(f"OCR API error: {str(e)}")
        return ""


def extract_text_from_document(file_url: str) -> str:
    """
    Main function to extract text from a document URL
    Supports PDFs and images
    """
    if not file_url:
        print("No file URL provided")
        return ""
    
    # Download the file with content-type detection
    file_bytes, content_type = download_file_with_type(file_url)
    if not file_bytes:
        print("Failed to download file")
        return ""
    
    # Detect file type from URL and content-type
    file_type = get_file_extension(file_url, content_type)
    print(f"Detected file type: {file_type} (Content-Type: {content_type})")
    
    # Extract text based on type
    if file_type == 'pdf' or 'pdf' in content_type.lower():
        text = extract_text_from_pdf(file_bytes)
        if text:
            return text
    
    if file_type == 'image' or 'image' in content_type.lower():
        return extract_text_from_image_ocr_api(file_bytes)
    
    # Unknown type - try PDF first, then image OCR
    print("Unknown file type, trying PDF extraction...")
    text = extract_text_from_pdf(file_bytes)
    if text:
        return text
    
    print("PDF extraction failed, trying OCR...")
    return extract_text_from_image_ocr_api(file_bytes)
