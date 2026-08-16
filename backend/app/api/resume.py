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
    current_user: User = Depends(get_current_user),
):
    """Upload PDF candidate resume, extract text, and save it for the current user."""

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files (.pdf) are allowed",
        )

    pdf_bytes = await file.read()
    extracted_text = extract_text_from_pdf(pdf_bytes)

    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract text from the uploaded PDF",
        )

    new_resume = Resume(
        user_id=current_user.id,
        file_name=file.filename,
        parsed_text=extracted_text,
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return {
        "id": new_resume.id,
        "file_name": new_resume.file_name,
        "character_count": len(str(new_resume.parsed_text)),
        "preview": (
            new_resume.parsed_text[:300] + "..."
            if len(str(new_resume.parsed_text)) > 300
            else new_resume.parsed_text
        ),
        "message": "Resume uploaded and text extracted successfully!",
    }


@router.get("/my-resumes")
def get_my_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all resumes uploaded by the current logged-in user."""

    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )

    return [
        {
            "id": resume.id,
            "file_name": resume.file_name,
            "created_at": resume.created_at,
            "character_count": len(resume.parsed_text),
        }
        for resume in resumes
]