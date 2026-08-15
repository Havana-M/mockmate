import os
import re
from typing import List
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split raw text into overlapping semantic chunks."""
    cleaned_text = re.sub(r'\s+', ' ', text).strip()
    if not cleaned_text:
        return []
        
    chunks = []
    start = 0
    while start < len(cleaned_text):
        end = start + chunk_size
        chunk = cleaned_text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
        
    return chunks

def extract_relevant_context(resume_text: str, role_title: str, top_k: int = 3) -> str:
    """Perform keyword-weighted semantic search over resume chunks to retrieve targeted background context."""
    chunks = chunk_text(resume_text)
    if not chunks:
        return ""
        
    role_words = set(role_title.lower().split())
    scored_chunks = []
    
    for chunk in chunks:
        score = 0
        chunk_lower = chunk.lower()
        for word in role_words:
            if len(word) > 2 and word in chunk_lower:
                score += 1
        scored_chunks.append((score, chunk))
        
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    selected_chunks = [item[1] for item in scored_chunks[:top_k]]
    
    return "\n---\n".join(selected_chunks)
