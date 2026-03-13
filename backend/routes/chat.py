from fastapi import APIRouter, HTTPException, Header, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import io

from database.db import get_db
from database.models import (
    User, ChatSession, ChatMessage,
    SendMessageRequest, MessageResponse, SessionResponse, ChatResponse,
    NotesRequest, NotesResponse,
    QuizRequest, QuizResponse, QuizQuestion, QuizOption,
    PdfResponse,
)
from services.gemini_service import ask_ai, generate_notes, generate_quiz, answer_with_pdf

router = APIRouter()


# ── Auth dependency ────────────────────────────────────────────────────────────

def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    api_key = authorization[7:]
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return user, db


# ── Sessions ──────────────────────────────────────────────────────────────────

@router.get("/sessions", response_model=List[SessionResponse])
def list_sessions(auth=Depends(get_current_user)):
    user, db = auth
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user.id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )
    return [
        SessionResponse(id=s.id, title=s.title, created_at=str(s.created_at))
        for s in sessions
    ]


@router.post("/sessions", response_model=SessionResponse)
def create_session(auth=Depends(get_current_user)):
    user, db = auth
    session = ChatSession(user_id=user.id, title="New Chat")
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionResponse(id=session.id, title=session.title, created_at=str(session.created_at))


@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
def get_session_messages(session_id: int, auth=Depends(get_current_user)):
    user, db = auth
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id, ChatSession.user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return [
        MessageResponse(id=m.id, role=m.role, content=m.content, created_at=str(m.created_at))
        for m in session.messages
    ]


# ── Chat ──────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(req: SendMessageRequest, auth=Depends(get_current_user)):
    user, db = auth

    # Resolve or create session
    if req.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == req.session_id, ChatSession.user_id == user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        # Create new session; title = first 60 chars of question
        title = req.message[:60] + ("…" if len(req.message) > 60 else "")
        session = ChatSession(user_id=user.id, title=title)
        db.add(session)
        db.commit()
        db.refresh(session)

    # Build history for context
    history = [
        {"role": msg.role, "content": msg.content}
        for msg in session.messages
    ]

    # Call OpenRouter
    ai_reply = await ask_ai(req.message, history=history)

    # Persist user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=req.message)
    db.add(user_msg)

    # Persist AI reply
    ai_msg = ChatMessage(session_id=session.id, role="assistant", content=ai_reply)
    db.add(ai_msg)

    # If this is the first message, set the session title
    if len(history) == 0 and session.title == "New Chat":
        session.title = req.message[:60] + ("…" if len(req.message) > 60 else "")

    db.commit()

    return ChatResponse(session_id=session.id, ai_reply=ai_reply)


@router.delete("/chat/{session_id}")
async def delete_chat_session(session_id: int, auth=Depends(get_current_user)):
    user, db = auth
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id, ChatSession.user_id == user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(session)
    db.commit()
    
    return {"message": "Chat deleted successfully"}


# ── Notes ─────────────────────────────────────────────────────────────────────

@router.post("/notes", response_model=NotesResponse)
async def notes(req: NotesRequest, auth=Depends(get_current_user)):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    result = await generate_notes(req.topic)
    return NotesResponse(topic=req.topic, notes=result)


# ── Quiz ──────────────────────────────────────────────────────────────────────

@router.post("/quiz", response_model=QuizResponse)
async def quiz(req: QuizRequest, auth=Depends(get_current_user)):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    raw = await generate_quiz(req.topic)
    if not raw:
        raise HTTPException(status_code=500, detail="Failed to generate quiz. Please try again.")
    questions = []
    for q in raw:
        options = [QuizOption(key=o["key"], text=o["text"]) for o in q.get("options", [])]
        questions.append(QuizQuestion(
            question=q["question"],
            options=options,
            answer=q["answer"],
        ))
    return QuizResponse(topic=req.topic, questions=questions)


# ── PDF ───────────────────────────────────────────────────────────────────────

@router.post("/pdf", response_model=PdfResponse)
async def analyze_pdf(file: UploadFile = File(...), auth=Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        import pdfplumber
        contents = await file.read()
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text = "\n\n".join(
                page.extract_text() or "" for page in pdf.pages
            )
    except ImportError:
        raise HTTPException(status_code=500, detail="pdfplumber not installed on server")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF appears to be empty or image-only")

    result = await answer_with_pdf(text)
    return PdfResponse(
        summary=result["summary"],
        key_points=result["key_points"],
        questions=result["questions"],
    )
