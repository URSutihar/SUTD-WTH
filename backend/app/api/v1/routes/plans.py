from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import uuid

from app.db.session import get_db
from app.models.trip import Trip
from app.models.chrono_plan import ChronoPlan
from app.schemas.chrono_plan import ChronoPlanResponse, PlanGenerationRequest
from app.core.security import get_current_user
from app.services.gemini_client import GeminiClient

router = APIRouter()


@router.post("/trips/{trip_id}/generate-plan")
async def generate_plan(
    trip_id: str,
    request: PlanGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a chronobiology plan for a trip"""
    # Check if trip exists and belongs to user
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["id"]
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Check if plan already exists and force_regenerate is False
    existing_plan = db.query(ChronoPlan).filter(ChronoPlan.trip_id == trip_id).first()
    if existing_plan and not request.force_regenerate:
        return {
            "message": "Plan already exists",
            "plan_id": str(existing_plan.id),
            "status": "existing"
        }
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Add background task to generate plan
    background_tasks.add_task(
        generate_plan_background,
        trip_id,
        current_user,
        job_id
    )
    
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Plan generation started"
    }


async def generate_plan_background(trip_id: str, current_user: dict, job_id: str):
    """Background task to generate chronobiology plan"""
    from app.db.session import SessionLocal
    
    db = SessionLocal()
    try:
        # Get trip data
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            return
        
        # Get user data
        from app.models.user import User
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if not user:
            return
        
        # Generate plan using Gemini
        gemini_client = GeminiClient()
        plan_data = await gemini_client.generate_chrono_plan(trip, user)
        
        # Delete existing plan if regenerating
        existing_plan = db.query(ChronoPlan).filter(ChronoPlan.trip_id == trip_id).first()
        if existing_plan:
            db.delete(existing_plan)
        
        # Create new plan
        chrono_plan = ChronoPlan(
            id=uuid.uuid4(),
            trip_id=trip_id,
            days=plan_data["days"],
            raw_gemini_response=plan_data.get("raw_response"),
            version="1.0.0"
        )
        
        db.add(chrono_plan)
        db.commit()
        
    except Exception as e:
        print(f"Error generating plan: {str(e)}")
    finally:
        db.close()


@router.get("/trips/{trip_id}/plan", response_model=ChronoPlanResponse)
async def get_plan(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the chronobiology plan for a trip"""
    # Check if trip exists and belongs to user
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["id"]
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Get the plan
    plan = db.query(ChronoPlan).filter(ChronoPlan.trip_id == trip_id).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found. Generate a plan first."
        )
    
    return plan
