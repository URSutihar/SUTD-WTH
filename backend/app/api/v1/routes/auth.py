from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import verify_google_token, create_access_token
from app.core.config import settings
import uuid

router = APIRouter()


@router.post("/google")
async def google_auth(
    code: str,
    db: Session = Depends(get_db)
):
    """Authenticate with Google OAuth code"""
    try:
        # Verify Google token
        user_info = verify_google_token(code)
        
        # Check if user exists
        user = db.query(User).filter(User.google_id == user_info['google_id']).first()
        
        if not user:
            # Create new user
            user = User(
                id=uuid.uuid4(),
                email=user_info['email'],
                name=user_info['name'],
                google_id=user_info['google_id'],
                timezone="UTC"  # Default timezone
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create JWT token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "timezone": user.timezone,
                "chronotype": user.chronotype,
                "sensitivity": user.sensitivity
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
