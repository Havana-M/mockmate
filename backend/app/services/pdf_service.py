import io
from pypdf import PdfReader
from fastapi import HTTPException, status

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text content from uploaded PDF bytes."""
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        
        extracted_text = ""
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
        
        cleaned_text = " ".join(extracted_text.split())
        
        if not cleaned_text or len(cleaned_text.strip()) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract readable text from PDF. Please upload a standard text PDF."
            )
            
        return cleaned_text
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading PDF file: {str(e)}"
        )
