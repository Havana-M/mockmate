import os
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def generate_interview_questions(role_title: str, resume_context: str, difficulty: str = "Medium") -> List[Dict[str, Any]]:
    """Generate 5 tailored interview questions using OpenAI or intelligent fallback templates."""
    if OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            
            prompt = f"""
            You are an expert technical interviewer conducting a mock interview for the role of '{role_title}'.
            Target Difficulty Level: {difficulty}
            
            Candidate Resume Context:
            {resume_context if resume_context else 'General technical background'}
            
            Generate exactly 5 realistic, high-quality interview questions tailored to this role and candidate background.
            Include a mix of:
            - 2 Technical Conceptual / Architecture questions
            - 1 Practical Coding / Data Structure challenge
            - 1 System Design / Scalability question
            - 1 Behavioral STAR scenario question
            
            Return ONLY a valid JSON array of objects with these exact keys:
            [
              {{
                "text": "Question prompt string...",
                "category": "conceptual" | "coding" | "system_design" | "behavioral",
                "difficulty": "{difficulty}",
                "expected_answer_hints": "Brief summary of key concepts candidate should mention"
              }}
            ]
            """
            
            response: Any = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result_text = response.choices[0].message.content or ""

            data = json.loads(result_text)
            
            if isinstance(data, dict) and "questions" in data:
                return data["questions"]
            elif isinstance(data, list):
                return data
        except Exception as e:
            print(f"OpenAI API Error: {e}, falling back to intelligent dynamic generator.")

    # High-quality dynamic fallback questions tailored to role & difficulty
    return [
        {
            "text": f"Can you walk me through your experience building scalable applications as a {role_title}? What architectural trade-offs did you make?",
            "category": "conceptual",
            "difficulty": difficulty,
            "expected_answer_hints": "System architecture, state management, API design, trade-off analysis."
        },
        {
            "text": "Given an unsorted array of integers, write an efficient function to find the maximum subarray sum (Kadane's Algorithm). Explain its time and space complexity.",
            "category": "coding",
            "difficulty": difficulty,
            "expected_answer_hints": "Dynamic programming, O(N) time complexity, O(1) space complexity."
        },
        {
            "text": "How would you design a real-time rate limiter for a high-traffic REST API handling 100,000 requests per minute?",
            "category": "system_design",
            "difficulty": difficulty,
            "expected_answer_hints": "Token Bucket / Leaky Bucket algorithms, Redis distributed counter, 429 Too Many Requests response."
        },
        {
            "text": "Describe a situation where a production deployment caused an issue. How did you diagnose, debug, and prevent it from recurring?",
            "category": "behavioral",
            "difficulty": difficulty,
            "expected_answer_hints": "STAR method (Situation, Task, Action, Result), log analysis, rollback strategy, post-mortem."
        },
        {
            "text": f"Based on your background, how do you handle asynchronous task processing and database connection pooling under heavy load in {role_title} projects?",
            "category": "conceptual",
            "difficulty": difficulty,
            "expected_answer_hints": "Message queues (Celery/RabbitMQ/Kafka), connection pool sizing, non-blocking I/O."
        }
    ]
