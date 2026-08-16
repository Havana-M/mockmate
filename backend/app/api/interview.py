from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.database import get_db
from app.models.models import User, Resume, InterviewSession, Question
from app.services.ai_service import generate_interview_questions
from app.services.rag_service import extract_relevant_context

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview Session & RAG Questions"],
)


class CreateSessionRequest(BaseModel):
    role_title: str
    difficulty: str = "Medium"
    resume_id: Optional[int] = None


@router.post("/generate")
def create_interview_session(
    payload: CreateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a real interview session for the logged-in user."""

    resume_context = ""

    if payload.resume_id:
        resume = (
            db.query(Resume)
            .filter(
                Resume.id == payload.resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )

        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found",
            )

        resume_context = extract_relevant_context(
            resume.parsed_text,
            payload.role_title,
        )

    session = InterviewSession(
        user_id=current_user.id,
        role_title=payload.role_title,
        track_type="Technical",
        difficulty=payload.difficulty,
        overall_score=0.0,
        status="in_progress",
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    generated_questions = generate_interview_questions(
        role_title=payload.role_title,
        resume_context=resume_context,
        difficulty=payload.difficulty,
    )

    created_questions = []

    for question_data in generated_questions:
        question = Question(
            session_id=session.id,
            question_text=question_data.get(
                "text",
                "Tell me about your technical experience.",
            ),
            question_type=question_data.get(
                "category",
                "voice",
            ),
            difficulty=question_data.get(
                "difficulty",
                payload.difficulty,
            ),
            ideal_answer=question_data.get(
                "expected_answer_hints",
                "",
            ),
        )

        db.add(question)
        created_questions.append(question)

    db.commit()

    for question in created_questions:
        db.refresh(question)

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "difficulty": session.difficulty,
        "status": session.status,
        "questions": [
            {
                "id": question.id,
                "text": question.question_text,
                "type": question.question_type,
                "difficulty": question.difficulty,
            }
            for question in created_questions
        ],
    }


@router.get("/session/{session_id}")
def get_session_details(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch a session belonging only to the logged-in user."""

    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    questions = (
        db.query(Question)
        .filter(Question.session_id == session.id)
        .order_by(Question.id.asc())
        .all()
    )

    return {
        "session_id": session.id,
        "role_title": session.role_title,
        "track_type": session.track_type,
        "status": session.status,
        "difficulty": session.difficulty,
        "overall_score": session.overall_score,
        "created_at": session.created_at,
        "questions": [
            {
                "id": question.id,
                "text": question.question_text,
                "type": question.question_type,
                "difficulty": question.difficulty,
                "ideal_answer": question.ideal_answer,
            }
            for question in questions
        ],
    }