from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine
from app.models import models
from app.api import auth, resume, interview, code, feedback


# ============================================================
# DATABASE
# ============================================================

# Automatically create all database tables on server startup
models.Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="MockMate AI Engine",
    description="Fullstack AI Mock Interview & Career Readiness Backend API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

origins = [
    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # Vercel production deployments
    "https://mockmate-git-main-havana-ms-projects.vercel.app",
    "https://mockmate-weld.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ROUTERS
# ============================================================

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(code.router)
app.include_router(feedback.router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to MockMate AI API Engine",
        "docs": "/docs",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MockMate AI Engine",
        "version": "1.0.0",
    }