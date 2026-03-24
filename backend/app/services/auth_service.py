from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse


def authenticate_user(db: Session, credentials: LoginRequest) -> User:
    user = db.query(User).filter(User.email == credentials.email).first()
    if user is None or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user


def login_user(db: Session, credentials: LoginRequest) -> TokenResponse:
    user = authenticate_user(db=db, credentials=credentials)
    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token)
