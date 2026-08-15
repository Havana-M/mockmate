import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    parsed_text = Column(Text, nullable=False)
    skills = Column(JSON, nullable=True)  # List of extracted skills
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_title = Column(String(255), nullable=False)  # e.g., "Fullstack Engineer"
    track_type = Column(String(50), nullable=False)   # "Technical" or "HR"
    difficulty = Column(String(50), nullable=False)   # "Easy", "Medium", "Hard"
    overall_score = Column(Float, default=0.0)
    status = Column(String(50), default="in_progress")  # "in_progress", "completed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    questions = relationship("Question", back_populates="session", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="session", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="voice")  # "voice" or "code"
    difficulty = Column(String(50), default="Medium")
    ideal_answer = Column(Text, nullable=True)

    session = relationship("InterviewSession", back_populates="questions")
    code_submissions = relationship("CodeSubmission", back_populates="question", cascade="all, delete-orphan")


class CodeSubmission(Base):
    __tablename__ = "code_submissions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    source_code = Column(Text, nullable=False)
    language = Column(String(50), default="javascript")
    execution_status = Column(String(50), default="passed")
    ai_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    question = relationship("Question", back_populates="code_submissions")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    user_transcript = Column(Text, nullable=True)
    technical_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    star_score = Column(Float, default=0.0)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    improved_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("InterviewSession", back_populates="feedbacks")
