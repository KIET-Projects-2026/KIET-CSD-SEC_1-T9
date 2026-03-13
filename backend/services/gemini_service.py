import os
import json
import re
import requests
from dotenv import load_dotenv
from typing import List, Dict, Optional

from pathlib import Path

# Load .env explicitly from the backend directory to avoid CWD issues
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-3.5-turbo"


def _check_key() -> bool:
    """Return True if the OpenRouter API key is configured."""
    return bool(OPENROUTER_API_KEY and OPENROUTER_API_KEY != "your_api_key_here")


def _call_openrouter(messages: List[Dict[str, str]]) -> str:
    """Send a request to OpenRouter chat completions and return the assistant reply."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    body = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
    }

    response = requests.post(
        OPENROUTER_API_URL, headers=headers, json=body, timeout=60
    )

    if response.status_code != 200:
        raise Exception(
            f"OpenRouter API error (HTTP {response.status_code}): {response.text}"
        )

    result = response.json()

    # Handle error responses from OpenRouter
    if "error" in result:
        raise Exception(f"OpenRouter API error: {result['error']}")

    return result["choices"][0]["message"]["content"]


# ── Chat ──────────────────────────────────────────────────────────────────────

async def ask_ai(question: str, history: Optional[List[Dict]] = None) -> str:
    """Send a question to OpenRouter with optional conversation history."""
    if not _check_key():
        return "⚠️ OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in backend/.env"

    try:
        messages = [
            {"role": "system", "content": "You are a helpful AI Study Buddy that explains concepts clearly."}
        ]

        # Append conversation history if present
        if history:
            for msg in history:
                messages.append({"role": msg["role"], "content": msg["content"]})

        # Append the current user question
        messages.append({"role": "user", "content": question})

        return _call_openrouter(messages)

    except Exception as e:
        print("OPENROUTER CHAT ERROR:", e)
        return f"Sorry, I encountered an error: {str(e)}"


# ── Notes ─────────────────────────────────────────────────────────────────────

async def generate_notes(topic: str) -> str:
    """Generate structured study notes for a topic."""
    if not _check_key():
        return "⚠️ OpenRouter API key not configured."

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful AI Study Buddy. Generate comprehensive, "
                "well-structured study notes. Include a clear title, multiple "
                "sections with subheadings, bullet points for key points, "
                "code examples where relevant, and a summary section at the end."
            ),
        },
        {"role": "user", "content": f"Generate detailed study notes on: {topic}"},
    ]

    try:
        return _call_openrouter(messages)
    except Exception as e:
        print("OPENROUTER NOTES ERROR:", e)
        return f"Sorry, I couldn't generate notes: {str(e)}"


# ── Quiz ──────────────────────────────────────────────────────────────────────

async def generate_quiz(topic: str) -> list:
    """Generate a list of MCQ questions for a topic. Returns list of dicts."""
    if not _check_key():
        return []

    messages = [
        {
            "role": "system",
            "content": (
                "You are a quiz generator. Return ONLY a valid JSON array, "
                "no extra text or markdown fences."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Generate exactly 5 multiple-choice quiz questions on: {topic}. "
                "Return ONLY a valid JSON array in this exact format: "
                '[{"question": "What is ...?", "options": [{"key": "A", "text": "Option text"}, '
                '{"key": "B", "text": "Option text"}, {"key": "C", "text": "Option text"}, '
                '{"key": "D", "text": "Option text"}], "answer": "A"}]. '
                "Ensure exactly 4 options (A,B,C,D) per question and answer must be one of the keys."
            ),
        },
    ]

    try:
        text = _call_openrouter(messages)
        text = text.strip()

        # Strip markdown code fences if present
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

        questions = json.loads(text)
        return questions
    except Exception as e:
        print("OPENROUTER QUIZ ERROR:", e)
        return []


# ── PDF ───────────────────────────────────────────────────────────────────────

async def answer_with_pdf(pdf_text: str) -> Dict[str, str]:
    """Analyze extracted PDF text and return summary, key points, questions."""
    if not _check_key():
        return {"summary": "⚠️ API key not configured.", "key_points": "", "questions": ""}

    # Truncate very long PDFs to avoid token limits
    max_chars: int = 15000
    truncated = pdf_text[:max_chars]
    if len(pdf_text) > max_chars:
        truncated += "\n\n[... content truncated for length ...]"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a study assistant. Analyze documents and produce: "
                "1. Summary (3-5 sentences overview) "
                "2. Key Points (bullet list of main concepts) "
                "3. Practice Questions (5 questions to test understanding)."
            ),
        },
        {"role": "user", "content": f"Analyze this document:\n\n{truncated}"},
    ]

    try:
        full = _call_openrouter(messages)

        # Split into three sections (best-effort)
        def extract_section(text: str, heading: str) -> str:
            pattern = rf"(?:##?\s*)?{re.escape(heading)}.*?\n(.*?)(?=##?\s*(?:Key Points|Practice Questions|$))"
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else text

        return {
            "summary": extract_section(full, "Summary"),
            "key_points": extract_section(full, "Key Points"),
            "questions": extract_section(full, "Practice Questions"),
        }
    except Exception as e:
        print("OPENROUTER PDF ERROR:", e)
        return {"summary": f"Error: {str(e)}", "key_points": "", "questions": ""}
