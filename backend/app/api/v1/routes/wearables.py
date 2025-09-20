from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.models.wearable import WearableData
from app.schemas.wearable import WearableDataCreate, WearableDataResponse
from app.core.security import get_current_user
import uuid

router = APIRouter()


@router.post("/webhook")
async def wearable_webhook(
    wearable_data: WearableDataCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Receive wearable data via webhook"""
    try:
        # Create wearable data record
        data = WearableData(
            id=uuid.uuid4(),
            user_id=current_user["id"],
            timestamp_utc=wearable_data.timestamp_utc,
            heart_rate=wearable_data.heart_rate,
            hrv=wearable_data.hrv,
            sleep_stage=wearable_data.sleep_stage,
            device_type=wearable_data.device_type
        )
        
        db.add(data)
        db.commit()
        db.refresh(data)
        
        return {"message": "Wearable data received successfully", "id": str(data.id)}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process wearable data: {str(e)}"
        )


@router.get("/", response_model=List[WearableDataResponse])
async def get_wearable_data(
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wearable data for the current user"""
    data = db.query(WearableData).filter(
        WearableData.user_id == current_user["id"]
    ).order_by(WearableData.timestamp_utc.desc()).offset(offset).limit(limit).all()
    
    return data


@router.get("/summary")
async def get_wearable_summary(
    days: int = 7,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get wearable data summary for the last N days"""
    from datetime import timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    data = db.query(WearableData).filter(
        WearableData.user_id == current_user["id"],
        WearableData.timestamp_utc >= cutoff_date
    ).all()
    
    # Calculate summary statistics
    heart_rates = [d.heart_rate for d in data if d.heart_rate is not None]
    hrv_values = [d.hrv for d in data if d.hrv is not None]
    sleep_stages = [d.sleep_stage for d in data if d.sleep_stage is not None]
    
    summary = {
        "total_records": len(data),
        "date_range": {
            "from": cutoff_date.isoformat(),
            "to": datetime.utcnow().isoformat()
        },
        "heart_rate": {
            "average": sum(heart_rates) / len(heart_rates) if heart_rates else None,
            "min": min(heart_rates) if heart_rates else None,
            "max": max(heart_rates) if heart_rates else None,
            "count": len(heart_rates)
        },
        "hrv": {
            "average": sum(hrv_values) / len(hrv_values) if hrv_values else None,
            "min": min(hrv_values) if hrv_values else None,
            "max": max(hrv_values) if hrv_values else None,
            "count": len(hrv_values)
        },
        "sleep_stages": {
            "total_records": len(sleep_stages),
            "stages": {}
        }
    }
    
    # Count sleep stages
    for stage in sleep_stages:
        summary["sleep_stages"]["stages"][stage] = summary["sleep_stages"]["stages"].get(stage, 0) + 1
    
    return summary
