from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.db.database import get_db
from app.models.models import User, Resume, InterviewSession, Question
from app.api.auth import get_current_user
from app.services.rag_service import extract_relevant_context
from app.services.ai_service import generate_interview_questions

router = APIRouter(prefix="/api/interview", tags=["Interview Session & RAG Questions"])

class CreateSessionRequest(BaseModel):
    role_title: str
    difficulty: str = "Medium"
    resume_id: Optional[int] = None

@router.post("/generate")
def create_interview_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a RAG-backed dynamic AI interview session with 5 questions."""
    resume_context = ""
    if payload.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == payload.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if resume:
            resume_context = extract_relevant_context(resume.raw_text, payload.role_title)

    # Create Session in DB
    session = InterviewSession(
        user_id=current_user.id,
        role_title=payload.role_title,
        difficulty=payload.difficulty,
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate 5 questions via AI / RAG
    generated_q_list = generate_interview_questions(
        role_title=payload.role_title,
        resume_context=resume_context,
        difficulty=payload.difficulty
    )

    created_questions = []
    for index, q in enumerate(generated_q_list):
        new_q = Question(
            session_id=session.id,
            question_text=q.get("text", "Sample question"),
            category=q.get("category", "conceptual"),
            difficulty=q.get("difficulty", payload.difficulty),
            expected_answer_hints=q.get("expected_answer_hints", ""),
            order_index=index + 1
        )
        db.add(new_q)
        created_questions.append(new_q)

    db.commit()

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "difficulty": session.difficulty,
        "questions": [
            {
                "id": q.id,
                "text": q.question_text,
                "category": q.category,
                "difficulty": q.difficulty,
                "order_index": q.order_index
            }
            for q in created_questions
        ]
    }

@router.get("/session/{session_id}")
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch active session details and questions."""
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    questions = db.query(Question).filter(
        Question.session_id == session.id
    ).order_by(Question.order_index.asc()).all()

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "status": session.status,
        "difficulty": session.difficulty,
        "created_at": session.created_at,
        "questions": [
            {
                "id": q.id,
                "text": q.question_text,
                "category": q.category,
                "difficulty": q.difficulty,
                "order_index": q.order_index
            }
            for q in questions
        ]
    }
