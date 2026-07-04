from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from app.database import get_session
from app.models import User
from app.security import create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

def get_current_user(authorization: Optional[str] = Header(None), session: Session = Depends(get_session)) -> User:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user = session.get(User, int(payload["sub"]))
            if user:
                return user
    
    # Fallback to default admin user (id=1) for seamless local MVP testing
    user = session.get(User, 1)
    if not user:
        user = User(id=1, name="FounderLabs Admin", email="admin@founderlabs.com", auth_provider="system")
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

@router.post("/login")
def login(req: LoginRequest, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == req.email)
    user = session.exec(statement).first()
    if not user:
        # Create user if doesn't exist for easy MVP demoing
        user = User(name=req.email.split("@")[0].title(), email=req.email, password_hash="hashed")
        session.add(user)
        session.commit()
        session.refresh(user)
    
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.post("/signup")
def signup(req: SignupRequest, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == req.email)
    if session.exec(statement).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(name=req.name, email=req.email, password_hash="hashed")
    session.add(user)
    session.commit()
    session.refresh(user)
    
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}
