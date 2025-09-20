from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationResponse, PushSubscriptionSchema
from app.core.security import get_current_user
import uuid

router = APIRouter()


@router.post("/subscribe")
async def subscribe_to_notifications(
    subscription: PushSubscriptionSchema,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Subscribe to push notifications"""
    try:
        # Store subscription in user settings
        from app.models.user import User
        user = db.query(User).filter(User.id == current_user["id"]).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user settings with push subscription
        settings = user.settings or {}
        settings["push_subscription"] = subscription.dict()
        user.settings = settings
        
        db.commit()
        
        return {"message": "Successfully subscribed to notifications"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to subscribe: {str(e)}"
        )


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for the current user"""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user["id"]
    ).order_by(Notification.scheduled_at_utc.desc()).all()
    
    return notifications


@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    try:
        notification = Notification(
            id=uuid.uuid4(),
            user_id=current_user["id"],
            trip_id=notification_data.trip_id,
            scheduled_at_utc=notification_data.scheduled_at_utc,
            payload=notification_data.payload
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create notification: {str(e)}"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user["id"]
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}
