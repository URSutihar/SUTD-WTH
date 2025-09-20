from celery import Celery
from typing import Dict, Any
import json
from datetime import datetime, timedelta
import pytz

from app.core.config import settings

# Initialize Celery
celery_app = Celery(
    "jetlag_coach",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)


@celery_app.task
def send_push_notification(user_id: str, notification_data: Dict[str, Any]):
    """Send push notification to user"""
    try:
        # This would integrate with a push notification service
        # For now, we'll just log the notification
        print(f"Sending push notification to user {user_id}: {notification_data}")
        
        # In a real implementation, you would:
        # 1. Get user's push subscription from database
        # 2. Send notification using web-push library
        # 3. Update notification status in database
        
        return {"status": "sent", "user_id": user_id}
        
    except Exception as e:
        print(f"Failed to send push notification: {str(e)}")
        return {"status": "failed", "error": str(e)}


@celery_app.task
def schedule_plan_reminders(trip_id: str, plan_data: Dict[str, Any]):
    """Schedule reminders for a chronobiology plan"""
    try:
        from app.db.session import SessionLocal
        from app.models.notification import Notification
        from app.models.trip import Trip
        import uuid
        
        db = SessionLocal()
        
        # Get trip to find user
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            return {"status": "failed", "error": "Trip not found"}
        
        # Schedule notifications for each action in the plan
        for day in plan_data.get("days", []):
            date_str = day["date_local"]
            
            for action in day.get("actions", []):
                # Create notification for each action
                notification = Notification(
                    id=uuid.uuid4(),
                    user_id=trip.user_id,
                    trip_id=trip_id,
                    scheduled_at_utc=datetime.utcnow() + timedelta(minutes=5),  # 5 minutes from now for demo
                    payload={
                        "type": "plan_reminder",
                        "action": action,
                        "date": date_str,
                        "title": f"JetLag Coach Reminder",
                        "body": action.get("instruction", "Time for your scheduled activity")
                    }
                )
                
                db.add(notification)
                
                # Schedule the actual push notification
                send_push_notification.apply_async(
                    args=[str(trip.user_id), notification.payload],
                    eta=notification.scheduled_at_utc
                )
        
        db.commit()
        db.close()
        
        return {"status": "scheduled", "trip_id": trip_id}
        
    except Exception as e:
        print(f"Failed to schedule reminders: {str(e)}")
        return {"status": "failed", "error": str(e)}


@celery_app.task
def cleanup_old_notifications():
    """Clean up old notifications"""
    try:
        from app.db.session import SessionLocal
        from app.models.notification import Notification
        from datetime import datetime, timedelta
        
        db = SessionLocal()
        
        # Delete notifications older than 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        old_notifications = db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).all()
        
        for notification in old_notifications:
            db.delete(notification)
        
        db.commit()
        db.close()
        
        return {"status": "cleaned", "count": len(old_notifications)}
        
    except Exception as e:
        print(f"Failed to cleanup notifications: {str(e)}")
        return {"status": "failed", "error": str(e)}
