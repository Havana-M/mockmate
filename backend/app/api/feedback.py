import json
import os
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.database import get_db
from app.models.models import User, InterviewSession, Question, Feedback

router = APIRouter(
    prefix="/api/interview",
    tags=["AI Scoring & STAR Feedback"],
)


class EvaluateSessionRequest(BaseModel):
    session_id: int
    answers: Dict[int, str]  # question_id -> candidate answer


def evaluate_answer_with_ai(
    question: Question,
    answer: str,
) -> Dict[str, Any]:
    """
    Evaluate one real candidate answer using OpenAI.
    """

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured on the backend.",
        )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        prompt = f"""
You are an expert technical and behavioral interview evaluator.

Evaluate the candidate's actual answer to the interview question below.

QUESTION:
{question.question_text}

QUESTION TYPE:
{question.question_type}

DIFFICULTY:
{question.difficulty}

IDEAL ANSWER / HINTS:
{question.ideal_answer or "No specific hints available."}

CANDIDATE ANSWER:
{answer}

Evaluate the answer based ONLY on what the candidate actually said.

Return ONLY valid JSON in this exact structure:

{{
  "technical_score": 0,
  "communication_score": 0,
  "star_score": 0,
  "overall_score": 0,
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2"
  ],
  "improved_answer": "A concise example of how the candidate could improve the answer."
}}

Scoring:
- technical_score: technical correctness, depth, reasoning, and relevance
- communication_score: clarity, organization, conciseness, and explanation quality
- star_score: how well the answer follows Situation, Task, Action, Result when applicable
- overall_score: holistic assessment from 0 to 100

Use 0-100 integer scores.
Do not invent experience or facts that are not present in the candidate answer.
For coding/technical questions, STAR score may be lower in importance, but still provide a score.
"""

        response: Any = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict but constructive interview evaluator."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
            stream=False,
        )

        content = response.choices[0].message.content or "{}"
        result = json.loads(content)

        return {
            "technical_score": max(
                0, min(100, int(result.get("technical_score", 0)))
            ),
            "communication_score": max(
                0, min(100, int(result.get("communication_score", 0)))
            ),
            "star_score": max(
                0, min(100, int(result.get("star_score", 0)))
            ),
            "overall_score": max(
                0, min(100, int(result.get("overall_score", 0)))
            ),
            "strengths": result.get("strengths", []),
            "weaknesses": result.get("weaknesses", []),
            "improved_answer": result.get("improved_answer", ""),
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI evaluation failed: {str(exc)}",
        )


@router.post("/evaluate")
def evaluate_interview_session(
    payload: EvaluateSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluate the logged-in user's actual interview answers
    and save real feedback to the database.
    """

    session = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == payload.session_id,
            InterviewSession.user_id == current_user.id,
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found",
        )

    if not payload.answers:
        raise HTTPException(
            status_code=400,
            detail="No interview answers were submitted.",
        )

    questions = (
        db.query(Question)
        .filter(Question.session_id == session.id)
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="No questions found for this interview session.",
        )

    results = []

    for question in questions:
        answer = payload.answers.get(question.id)

        if answer is None:
            continue

        answer = answer.strip()

        if not answer:
            continue

        evaluation = evaluate_answer_with_ai(
            question=question,
            answer=answer,
        )

        feedback_record = Feedback(
            session_id=session.id,
            question_id=question.id,
            user_transcript=answer,
            technical_score=evaluation["technical_score"],
            communication_score=evaluation["communication_score"],
            star_score=evaluation["star_score"],
            strengths=evaluation["strengths"],
            weaknesses=evaluation["weaknesses"],
            improved_answer=evaluation["improved_answer"],
        )

        db.add(feedback_record)

        results.append(
            {
                "question_id": question.id,
                "technical_score": evaluation["technical_score"],
                "communication_score": evaluation["communication_score"],
                "star_score": evaluation["star_score"],
                "overall_score": evaluation["overall_score"],
                "strengths": evaluation["strengths"],
                "weaknesses": evaluation["weaknesses"],
                "improved_answer": evaluation["improved_answer"],
            }
        )

    if not results:
        raise HTTPException(
            status_code=400,
            detail="No valid answers were provided for evaluation.",
        )

    session.overall_score = round(
        sum(result["overall_score"] for result in results) / len(results),
        2,
    )

    session.status = "completed"

    db.commit()

    return {
        "session_id": session.id,
        "overall_score": session.overall_score,
        "status": session.status,
        "questions_evaluated": len(results),
        "results": results,
    }