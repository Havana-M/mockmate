import os
import time
import httpx

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import CodeSubmission


router = APIRouter(
    prefix="/api/code",
    tags=["Code Execution & AI Evaluation"]
)


# =========================================================
# Request Models
# =========================================================

class CodeRunRequest(BaseModel):
    code: str
    language: str = "python"
    stdin: str = ""
    question_id: Optional[int] = None


# =========================================================
# Judge0 Configuration
# =========================================================

JUDGE0_URL = os.getenv(
    "JUDGE0_URL",
    "https://ce.judge0.com"
).rstrip("/")


LANGUAGE_IDS = {
    "python": 71,
    "cpp": 54,
    "c++": 54,
    "java": 62,
    "javascript": 63,
    "js": 63,
}


# =========================================================
# CODE EXECUTION
# =========================================================

@router.post("/run")
def execute_code(payload: CodeRunRequest):
    """
    Execute code using Judge0.

    Supported:
    - Python
    - C++
    - Java
    - JavaScript

    HTML/CSS are handled as browser preview.
    """

    language = payload.language.lower().strip()

    # -----------------------------------------------------
    # HTML / CSS
    # -----------------------------------------------------

    if language in ["html", "css"]:
        return {
            "output": "HTML/CSS should be run in the browser preview.",
            "status": "preview",
            "execution_time": 0,
            "execution_time_ms": 0,
            "memory_kb": 0,
            "exit_code": 0,
            "signal": None
        }

    # -----------------------------------------------------
    # Get Judge0 Language ID
    # -----------------------------------------------------

    language_id = LANGUAGE_IDS.get(language)

    if language_id is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {payload.language}"
        )

    # -----------------------------------------------------
    # Submit Code
    # -----------------------------------------------------

    try:
        with httpx.Client(timeout=15.0) as client:

            response = client.post(
                f"{JUDGE0_URL}/submissions",
                params={
                    "base64_encoded": "false"
                },
                json={
                    "source_code": payload.code,
                    "language_id": language_id,
                    "stdin": payload.stdin
                }
            )

            response.raise_for_status()

            submission_data = response.json()

            token = submission_data.get("token")

            if not token:
                raise HTTPException(
                    status_code=500,
                    detail="Judge0 did not return a submission token."
                )

            # -------------------------------------------------
            # Poll Judge0 for Result
            # -------------------------------------------------

            result = None

            for _ in range(20):

                time.sleep(0.5)

                result_response = client.get(
                    f"{JUDGE0_URL}/submissions/{token}",
                    params={
                        "base64_encoded": "false"
                    }
                )

                result_response.raise_for_status()

                result = result_response.json()

                status_id = result.get(
                    "status",
                    {}
                ).get("id")

                # 1 = In Queue
                # 2 = Processing
                # 3+ = Finished

                if status_id not in [1, 2]:
                    break

            # -------------------------------------------------
            # No Result
            # -------------------------------------------------

            if result is None:
                raise HTTPException(
                    status_code=504,
                    detail="Judge0 did not return a result."
                )

            # -------------------------------------------------
            # Extract Result
            # -------------------------------------------------

            status_info = result.get(
                "status",
                {}
            )

            status_id = status_info.get("id")

            status_description = status_info.get(
                "description",
                "Unknown"
            )

            stdout = result.get("stdout") or ""
            stderr = result.get("stderr") or ""
            compile_output = result.get("compile_output") or ""

            execution_time = result.get("time")
            memory = result.get("memory")

            # -------------------------------------------------
            # Determine Output
            # -------------------------------------------------

            if compile_output:
                output = compile_output

            elif stderr:
                output = stderr

            elif stdout:
                output = stdout

            else:
                output = "Code executed successfully with no output."

            # -------------------------------------------------
            # Determine Status
            # -------------------------------------------------

            if status_id == 3:
                execution_status = "success"

            elif status_id == 5:
                execution_status = "error"
                output = "Time Limit Exceeded."

            elif status_id in [
                6,   # Compilation Error
                7,   # Runtime Error (SIGSEGV)
                8,   # Runtime Error (SIGXFSZ)
                9,   # Time Limit Exceeded
                10,  # Runtime Error (SIGFPE)
                11,  # Runtime Error (SIGABRT)
                12,  # Runtime Error (NZEC)
                13,  # Other Runtime Error
                14   # Internal Error
            ]:
                execution_status = "error"

            else:
                execution_status = "error"

            # -------------------------------------------------
            # Return Result
            # -------------------------------------------------

            return {
                "output": output,
                "status": execution_status,
                "judge0_status": status_description,
                "execution_time": execution_time,
                "execution_time_ms": (
                    round(
                        float(execution_time) * 1000,
                        2
                    )
                    if execution_time
                    else None
                ),
                "memory_kb": memory,
                "exit_code": result.get("exit_code"),
                "signal": result.get("signal")
            }

    # -----------------------------------------------------
    # HTTPX Error
    # -----------------------------------------------------

    except httpx.HTTPError as error:

        raise HTTPException(
            status_code=502,
            detail=f"Judge0 connection error: {str(error)}"
        )

    # -----------------------------------------------------
    # Preserve FastAPI HTTP Errors
    # -----------------------------------------------------

    except HTTPException:
        raise

    # -----------------------------------------------------
    # Unexpected Error
    # -----------------------------------------------------

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Code execution failed: {str(error)}"
        )


# =========================================================
# CODE EVALUATION
# =========================================================

@router.post("/evaluate")
def evaluate_code(
    payload: CodeRunRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze code submission for basic
    time and space complexity.
    """

    code_text = payload.code.lower()

    # -----------------------------------------------------
    # Time Complexity
    # -----------------------------------------------------

    first_for = code_text.find("for ")

    if (
        first_for != -1
        and "for " in code_text[first_for + 4:]
    ):
        time_complexity = "O(N²)"

    elif (
        "for " in code_text
        or "while " in code_text
    ):
        time_complexity = "O(N)"

    else:
        time_complexity = "O(1)"

    # -----------------------------------------------------
    # Space Complexity
    # -----------------------------------------------------

    if (
        "[" in code_text
        or "dict()" in code_text
        or "set()" in code_text
        or "list()" in code_text
    ):
        space_complexity = "O(N)"

    else:
        space_complexity = "O(1)"

    # -----------------------------------------------------
    # Save Submission
    # -----------------------------------------------------

    submission = CodeSubmission(
        question_id=payload.question_id,
        source_code=payload.code,
        language=payload.language,
        execution_status="passed"
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "submission_id": submission.id,
        "status": "passed",
        "time_complexity": time_complexity,
        "space_complexity": space_complexity,
        "feedback": (
            f"Your solution achieves "
            f"{time_complexity} time complexity and "
            f"{space_complexity} space complexity. "
            f"Clean algorithm implementation!"
        )
    }