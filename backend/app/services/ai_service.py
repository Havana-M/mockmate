import json
import os
from typing import Any, Dict, List

from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def _normalize_questions(
    questions: Any,
    difficulty: str,
) -> List[Dict[str, Any]]:
    """
    Validate and normalize AI-generated questions.
    Returns at most 5 usable questions.
    """
    if not isinstance(questions, list):
        return []

    normalized: List[Dict[str, Any]] = []

    for question in questions:
        if not isinstance(question, dict):
            continue

        text = question.get("text")
        if not isinstance(text, str) or not text.strip():
            continue

        normalized.append(
            {
                "text": text.strip(),
                "category": str(
                    question.get("category", "conceptual")
                ),
                "difficulty": str(
                    question.get("difficulty", difficulty)
                ),
                "expected_answer_hints": str(
                    question.get("expected_answer_hints", "")
                ),
            }
        )

    return normalized[:5]


def _fallback_questions(
    role_title: str,
    difficulty: str,
) -> List[Dict[str, Any]]:
    """
    Realistic interviewer-style fallback questions.

    Difficulty is intentionally strict:
    Easy   -> fundamentals and basic interview concepts
    Medium -> practical development and moderate problem solving
    Hard   -> advanced engineering, architecture and scalability
    """

    role = role_title.strip().lower()

    # ---------------------------------------------------------
    # PYTHON
    # ---------------------------------------------------------
    if "python" in role:

        if difficulty == "Easy":
            return [
                {
                    "text": "What are variables in Python? How do you create a variable and assign a value to it?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Variable assignment, dynamic typing, examples such as name = 'John' and age = 21.",
                },
                {
                    "text": "What are the basic data types available in Python?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "int, float, str, bool, list, tuple, set, dict, NoneType.",
                },
                {
                    "text": "What is the difference between a list and a tuple in Python?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Mutability, syntax, use cases, performance considerations.",
                },
                {
                    "text": "What is a function in Python, and how do you define and call one?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "def keyword, parameters, return value, function call.",
                },
                {
                    "text": "What is the difference between == and is in Python?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Equality comparison versus object identity.",
                },
            ]

        if difficulty == "Medium":
            return [
                {
                    "text": "What is the difference between a shallow copy and a deep copy in Python? When would you use each?",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "copy module, nested objects, copy() versus deepcopy().",
                },
                {
                    "text": "How does exception handling work in Python? Explain try, except, else, and finally.",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Exception flow, error handling, finally execution.",
                },
                {
                    "text": "What is a list comprehension in Python? Rewrite a simple loop using a list comprehension.",
                    "category": "coding",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Compact iteration, filtering, readable Python syntax.",
                },
                {
                    "text": "What is the difference between a class method, static method, and instance method in Python?",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "self, cls, @classmethod, @staticmethod, method binding.",
                },
                {
                    "text": "How would you find the first non-repeating character in a string using Python?",
                    "category": "coding",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Dictionary or Counter, frequency counting, O(n) approach.",
                },
            ]

        return [
            {
                "text": "How does Python manage memory, and what role does garbage collection play?",
                "category": "conceptual",
                "difficulty": "Hard",
                "expected_answer_hints": "Reference counting, cyclic garbage collection, memory management.",
            },
            {
                "text": "What are Python decorators? Explain how you would create a custom decorator.",
                "category": "conceptual",
                "difficulty": "Hard",
                "expected_answer_hints": "Higher-order functions, closures, wrapper functions, @decorator syntax.",
            },
            {
                "text": "What is the Global Interpreter Lock in CPython, and how does it affect multithreading?",
                "category": "conceptual",
                "difficulty": "Hard",
                "expected_answer_hints": "GIL, CPU-bound versus I/O-bound work, multiprocessing and async alternatives.",
            },
            {
                "text": "How would you optimize a Python API that becomes slow when processing a large number of requests?",
                "category": "system_design",
                "difficulty": "Hard",
                "expected_answer_hints": "Profiling, caching, database optimization, async I/O, workers, horizontal scaling.",
            },
            {
                "text": "How would you design a scalable Python service that can handle a sudden increase in traffic?",
                "category": "system_design",
                "difficulty": "Hard",
                "expected_answer_hints": "Load balancing, stateless services, caching, database scaling, queues, observability.",
            },
        ]

    # ---------------------------------------------------------
    # JAVASCRIPT / TYPESCRIPT
    # ---------------------------------------------------------
    if "javascript" in role or "typescript" in role:

        if difficulty == "Easy":
            return [
                {
                    "text": "What is a variable in JavaScript, and what is the difference between let, const, and var?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Declaration, scope, reassignment, block scope.",
                },
                {
                    "text": "What are the basic data types in JavaScript?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "String, number, boolean, undefined, null, bigint, symbol, object.",
                },
                {
                    "text": "What is the difference between == and === in JavaScript?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Loose equality versus strict equality and type coercion.",
                },
                {
                    "text": "What is a function in JavaScript? Show how you would define and call one.",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Function declaration, parameters, return values.",
                },
                {
                    "text": "What is an array in JavaScript, and how do you add or remove elements from one?",
                    "category": "conceptual",
                    "difficulty": "Easy",
                    "expected_answer_hints": "Arrays, push, pop, shift, unshift.",
                },
            ]

        if difficulty == "Medium":
            return [
                {
                    "text": "What is the difference between map(), filter(), and reduce() in JavaScript?",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Transformation, filtering, accumulation.",
                },
                {
                    "text": "What is a closure in JavaScript? Give a practical example.",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Lexical scope, retained variables, function returning another function.",
                },
                {
                    "text": "How does asynchronous programming work in JavaScript?",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Promises, async/await, event loop.",
                },
                {
                    "text": "How would you handle an API request that fails intermittently in a frontend application?",
                    "category": "conceptual",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Error handling, retry strategy, timeout, user feedback.",
                },
                {
                    "text": "Write a function to remove duplicate values from an array and explain its time complexity.",
                    "category": "coding",
                    "difficulty": "Medium",
                    "expected_answer_hints": "Set or object-based approach, O(n) expected complexity.",
                },
            ]

        return [
            {
                "text": "Explain the JavaScript event loop and how microtasks differ from macrotasks.",
                "category": "conceptual",
                "difficulty": "Hard",
                "expected_answer_hints": "Call stack, task queue, microtask queue, promises, event loop.",
            },
            {
                "text": "How would you optimize the performance of a large React or TypeScript application?",
                "category": "system_design",
                "difficulty": "Hard",
                "expected_answer_hints": "Code splitting, memoization, lazy loading, rendering optimization, profiling.",
            },
            {
                "text": "How would you design a frontend architecture for an application with millions of users?",
                "category": "system_design",
                "difficulty": "Hard",
                "expected_answer_hints": "CDN, caching, code splitting, observability, API architecture.",
            },
            {
                "text": "What are common causes of memory leaks in JavaScript applications, and how would you debug them?",
                "category": "conceptual",
                "difficulty": "Hard",
                "expected_answer_hints": "Event listeners, timers, retained references, browser profiling.",
            },
            {
                "text": "How would you design a scalable real-time web application using WebSockets?",
                "category": "system_design",
                "difficulty": "Hard",
                "expected_answer_hints": "WebSocket servers, load balancing, pub/sub, Redis, horizontal scaling.",
            },
        ]

    # ---------------------------------------------------------
    # GENERIC SOFTWARE / FULL STACK
    # ---------------------------------------------------------
    if difficulty == "Easy":
        return [
            {
                "text": f"What are the main technologies you would use as a {role_title}, and what is the purpose of each?",
                "category": "conceptual",
                "difficulty": "Easy",
                "expected_answer_hints": "Candidate should explain core technologies relevant to the role.",
            },
            {
                "text": "What is an API, and why is it commonly used in software applications?",
                "category": "conceptual",
                "difficulty": "Easy",
                "expected_answer_hints": "Application Programming Interface, communication between software components.",
            },
            {
                "text": "What is the difference between a client and a server?",
                "category": "conceptual",
                "difficulty": "Easy",
                "expected_answer_hints": "Client requests services, server processes and responds.",
            },
            {
                "text": "What is a database, and why do applications need one?",
                "category": "conceptual",
                "difficulty": "Easy",
                "expected_answer_hints": "Persistent data storage, querying and managing application data.",
            },
            {
                "text": "What is Git, and why do developers use version control?",
                "category": "conceptual",
                "difficulty": "Easy",
                "expected_answer_hints": "Version history, collaboration, branching, reverting changes.",
            },
        ]

    if difficulty == "Medium":
        return [
            {
                "text": f"Can you explain one project you built as a {role_title} and the main technical decisions you made?",
                "category": "conceptual",
                "difficulty": "Medium",
                "expected_answer_hints": "Project architecture, technology choices, implementation decisions.",
            },
            {
                "text": "How would you design a REST API for a simple application? Which HTTP methods would you use?",
                "category": "conceptual",
                "difficulty": "Medium",
                "expected_answer_hints": "GET, POST, PUT/PATCH, DELETE, resources, status codes.",
            },
            {
                "text": "How would you debug an application where an API request is returning a 500 Internal Server Error?",
                "category": "conceptual",
                "difficulty": "Medium",
                "expected_answer_hints": "Logs, stack traces, request validation, backend debugging.",
            },
            {
                "text": "Given an array of integers, how would you find duplicate values efficiently?",
                "category": "coding",
                "difficulty": "Medium",
                "expected_answer_hints": "Hash set or frequency map, expected O(n) time.",
            },
            {
                "text": "Tell me about a technical problem you faced in a project and how you solved it.",
                "category": "behavioral",
                "difficulty": "Medium",
                "expected_answer_hints": "Situation, Task, Action, Result with concrete technical details.",
            },
        ]

    # Hard
    return [
        {
            "text": "How would you design a scalable backend service for a high-traffic application?",
            "category": "system_design",
            "difficulty": "Hard",
            "expected_answer_hints": "Stateless services, load balancing, caching, database scaling, monitoring.",
        },
        {
            "text": "How would you identify and fix a performance bottleneck in a production application?",
            "category": "conceptual",
            "difficulty": "Hard",
            "expected_answer_hints": "Profiling, metrics, logs, tracing, bottleneck isolation and optimization.",
        },
        {
            "text": "How would you design an application that remains available if one backend instance fails?",
            "category": "system_design",
            "difficulty": "Hard",
            "expected_answer_hints": "Multiple instances, load balancing, health checks, redundancy.",
        },
        {
            "text": "How would you handle a database that is becoming a bottleneck as application traffic increases?",
            "category": "system_design",
            "difficulty": "Hard",
            "expected_answer_hints": "Indexing, query optimization, caching, read replicas, partitioning.",
        },
        {
            "text": "Describe a difficult production issue you handled and explain how you diagnosed the root cause.",
            "category": "behavioral",
            "difficulty": "Hard",
            "expected_answer_hints": "STAR structure, debugging process, root cause, resolution and prevention.",
        },
    ]


def generate_interview_questions(
    role_title: str,
    resume_context: str,
    difficulty: str = "Medium",
) -> List[Dict[str, Any]]:
    """
    Generate 5 realistic interview questions.

    The interview follows this principle:

    1. Difficulty controls the complexity of the questions.
    2. Questions should sound like real interviewer questions.
    3. Fundamentals come first for Easy interviews.
    4. Resume information is used for personalization.
    5. Advanced architecture/system-design questions are reserved
       for Hard interviews unless naturally appropriate.
    """

    difficulty = difficulty.strip().title()

    if difficulty not in {"Easy", "Medium", "Hard"}:
        difficulty = "Medium"

    if not role_title.strip():
        role_title = "Software Developer"

    if OPENAI_API_KEY:
        try:
            from openai import OpenAI

            client = OpenAI(api_key=OPENAI_API_KEY)

            resume_text = (
                resume_context.strip()
                if resume_context and resume_context.strip()
                else "No resume information is available."
            )

            difficulty_rules = {
                "Easy": """
- Ask beginner/foundation interview questions.
- Focus on concepts every candidate for this role should know.
- Prefer questions such as "What is...", "What is the difference between...", "How do you...".
- Include basic coding only when appropriate.
- DO NOT ask system-design, scalability, distributed-systems, production-architecture,
  or senior-level trade-off questions.
""",
                "Medium": """
- Ask practical interview questions expected from a candidate with some project experience.
- Cover concepts, practical development, debugging, moderate coding and project understanding.
- System design can be introductory, but avoid senior distributed-system questions.
""",
                "Hard": """
- Ask advanced technical interview questions.
- Include difficult coding, optimization, architecture, scalability and system-design questions
  when appropriate for the role.
- Questions should still be realistic interview questions rather than research questions.
""",
            }

            prompt = f"""
You are conducting a REAL technical job interview.

Candidate target role:
{role_title}

Interview difficulty:
{difficulty}

DIFFICULTY RULES:
{difficulty_rules[difficulty]}

Candidate resume:
{resume_text}

Your job is to generate exactly 5 questions that a real interviewer would
naturally ask this candidate.

IMPORTANT:

1. The questions must be realistic interview questions.
2. Do not generate random theoretical questions just to fill categories.
3. The difficulty must genuinely match "{difficulty}".
4. For Easy interviews, start with fundamentals that every candidate should know
   for the target role.
5. Resume information should personalize some questions, but do not make every
   question depend on the resume.
6. If the resume contains projects, technologies, internships or skills that are
   relevant to the role, include 1 or 2 questions about them.
7. Do not invent anything about the candidate.
8. Do not claim the candidate used a technology unless it appears in the resume.
9. Questions should be direct and conversational, like an interviewer speaking
   to a candidate.
10. Avoid artificial wording such as "based on your background" unless an
    interviewer would genuinely say that.
11. Do not include answers in the question text.

QUESTION MIX:

For Easy:
- 4 fundamental technical questions
- 1 simple coding or practical question

For Medium:
- 2 conceptual questions
- 1 practical/coding question
- 1 project/debugging question
- 1 behavioral or practical engineering question

For Hard:
- 2 advanced technical questions
- 1 difficult coding/problem-solving question
- 1 system-design/architecture question
- 1 behavioral/project-depth question

For Python roles, Easy questions should cover topics such as:
variables, data types, lists, tuples, dictionaries, functions, loops,
conditions, exceptions, modules, basic OOP, and similar fundamentals.

For JavaScript/TypeScript roles, Easy questions should cover:
variables, data types, functions, arrays, objects, conditions, loops,
scope, equality, basic asynchronous concepts and similar fundamentals.

For other roles, choose fundamentals that are genuinely expected for that role.

Return ONLY this JSON object:

{{
    "questions": [
        {{
            "text": "Real interview question",
            "category": "conceptual",
            "difficulty": "{difficulty}",
            "expected_answer_hints": "Short description of what a good answer should cover"
        }}
    ]
}}

The array MUST contain exactly 5 questions.
"""

            response: Any = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a professional technical interviewer. "
                            "Generate realistic interview questions and strictly "
                            "follow the requested difficulty."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.4,
                response_format={"type": "json_object"},
            )

            result_text = response.choices[0].message.content or ""

            data = json.loads(result_text)

            if isinstance(data, dict):
                questions = _normalize_questions(
                    data.get("questions"),
                    difficulty,
                )

                if len(questions) == 5:
                    return questions

        except Exception as exc:
            print(
                f"OpenAI question generation failed: {exc}. "
                "Using realistic fallback questions."
            )

    return _fallback_questions(role_title, difficulty)