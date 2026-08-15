from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, Resume
from app.api.auth import get_current_user
from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/api/resume", tags=["Resume Upload & RAG"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload PDF candidate resume, extract raw text, and save record."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files (.pdf) are allowed"
        )

    pdf_bytes = await file.read()
    extracted_text = extract_text_from_pdf(pdf_bytes)

    new_resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=extracted_text
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return {
        "id": new_resume.id,
        "filename": new_resume.filename,
        "character_count": len(extracted_text),
        "preview": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text,
        "message": "Resume uploaded and text extracted successfully!"
    }

@router.get("/my-resumes")
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all uploaded resumes for the current logged-in candidate."""
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "created_at": r.created_at,
            "character_count": len(r.raw_text)
        }
        for r in resumes
    ]
