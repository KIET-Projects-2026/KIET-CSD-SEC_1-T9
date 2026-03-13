import uuid
import bcrypt
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import User, SignupRequest, LoginRequest, AuthResponse

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    password_hash = bcrypt.hashpw(
        req.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    # Generate unique API key
    api_key = str(uuid.uuid4())

    # Create user
    user = User(
        name=req.name,
        email=req.email,
        password_hash=password_hash,
        api_key=api_key,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AuthResponse(
        message="User registered successfully",
        api_key=api_key,
        name=req.name,
    )


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not bcrypt.checkpw(
        req.password.encode("utf-8"),
        user.password_hash.encode("utf-8"),
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        message="Login successful",
        api_key=user.api_key,
        name=user.name,
    )
