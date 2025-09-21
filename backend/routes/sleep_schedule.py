from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import SleepSchedulePlanCreate, SleepSchedulePlanResponse
from services.supabase_service import SupabaseService
from services.gemini_service import GeminiService

router = APIRouter(
    prefix="/api/v1/sleep-schedule",
    tags=["sleep-schedule"]
)

# Dependency to get SupabaseService instance
def get_supabase_service():
    return SupabaseService()

@router.post("/generate-plan", response_model=SleepSchedulePlanResponse)
async def generate_sleep_schedule_plan(
    request: SleepSchedulePlanCreate,
    supabase: SupabaseService = Depends(get_supabase_service)
):
    """Create a new sleep schedule plan and generate a plan."""
    try:
        # Use demo user ID if not provided
        plan_data = request.dict()
        if not plan_data.get('user_id'):
            plan_data['user_id'] = '00000000-0000-0000-0000-000000000001'  # Valid UUID format
        
        # Create the sleep schedule plan in the database
        created_plan = await supabase.create_sleep_schedule_plan(plan_data)
        if not created_plan:
            raise HTTPException(status_code=500, detail="Failed to create sleep schedule plan")

        plan_id = created_plan["id"]
        print(f"Created sleep schedule plan with ID: {plan_id}")

        # Generate AI plan using Gemini
        try:
            gemini_service = GeminiService()
            
            # Prepare user data (similar to trip plans)
            user_data = {
                "id": plan_data['user_id'],
                "chronotype": request.preferences.get('chronotype', 'intermediate'),
                "sleep_baseline": {
                    "bedtime": request.current_schedule.get('bedtime', '23:00'),
                    "waketime": request.current_schedule.get('waketime', '07:00'),
                    "typical_duration_minutes": 480  # Default 8 hours
                }
            }
            
            # Prepare sleep schedule data
            sleep_schedule_data = {
                "id": plan_id,
                "current_schedule": request.current_schedule,
                "desired_schedule": request.desired_schedule,
                "sleep_issues": request.sleep_issues,
                "preferences": request.preferences
            }
            
            # Generate the AI plan
            ai_response = await gemini_service.generate_sleep_schedule_plan(user_data, sleep_schedule_data)
            print(f"Generated AI response for sleep schedule plan: {ai_response.get('plan_type', 'unknown')}")
            
            # Normalize the schedule (similar to trip plans)
            normalized_schedule = _normalize_sleep_schedule_schedule(ai_response, plan_id)
            
            # Save the schedule
            await supabase.save_schedule_generic(
                plan_type="sleep_schedule",
                plan_id=plan_id,
                raw_ai_response=ai_response,
                normalized_schedule=normalized_schedule
            )
            
            return SleepSchedulePlanResponse(**created_plan, schedule=normalized_schedule)
            
        except Exception as ai_error:
            print(f"AI generation failed, using placeholder: {ai_error}")
            
            # Fallback to placeholder if AI fails
            placeholder_schedule = {
                "schedule_version": "1.0",
                "plan_type": "sleep_schedule_adjustment",
                "plan_id": plan_id,
                "timezone": "UTC",
                "phases": [
                    {
                        "phase_name": "gradual_adjustment",
                        "start_local": "2025-01-01T00:00:00Z",
                        "end_local": "2025-01-14T23:59:59Z",
                        "actions": [
                            {
                                "action_id": "a1",
                                "type": "light",
                                "when_local": "2025-01-01T07:00:00Z",
                                "when_utc": "2025-01-01T07:00:00Z",
                                "duration_minutes": 30,
                                "priority": "high",
                                "details": "Get morning light exposure to advance circadian clock",
                                "dose_mg": None,
                                "safety_notes": None
                            }
                        ]
                    }
                ],
                "disclaimer": "This is a placeholder schedule. AI integration is being improved.",
                "metadata": {"generated_at_utc": "2025-01-01T00:00:00Z", "model": "Placeholder"}
            }
            
            await supabase.save_schedule_generic(
                plan_type="sleep_schedule",
                plan_id=plan_id,
                raw_ai_response={"message": "AI integration failed, using placeholder"},
                normalized_schedule=placeholder_schedule
            )

            return SleepSchedulePlanResponse(**created_plan, schedule=placeholder_schedule)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans", response_model=List[SleepSchedulePlanResponse])
async def get_sleep_schedule_plans(
    user_id: str,
    supabase: SupabaseService = Depends(get_supabase_service)
):
    """Get all sleep schedule plans for a user."""
    try:
        plans = await supabase.get_user_sleep_schedule_plans(user_id)
        return plans
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/{plan_id}", response_model=SleepSchedulePlanResponse)
async def get_sleep_schedule_plan(
    plan_id: str,
    supabase: SupabaseService = Depends(get_supabase_service)
):
    """Get a single sleep schedule plan by ID."""
    try:
        plan = await supabase.get_sleep_schedule_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Sleep schedule plan not found")
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _normalize_sleep_schedule_schedule(ai_response: dict, plan_id: str) -> dict:
    """Normalize AI response for sleep schedule"""
    try:
        # Ensure all actions have proper UTC timestamps
        for phase in ai_response.get("phases", []):
            for action in phase.get("actions", []):
                if "when_local" in action and "when_utc" not in action:
                    # Convert local time to UTC (simplified - should use proper timezone conversion)
                    local_time = action["when_local"]
                    action["when_utc"] = local_time.replace("Z", "Z") if local_time.endswith("Z") else f"{local_time}Z"
        
        # Add plan_id to the response
        ai_response["plan_id"] = plan_id
        
        return ai_response
    except Exception as e:
        print(f"Error normalizing sleep schedule: {e}")
        # Return a basic structure if normalization fails
        return {
            "schedule_version": "1.0",
            "plan_type": "sleep_schedule_adjustment",
            "plan_id": plan_id,
            "timezone": "UTC",
            "phases": [],
            "disclaimer": "Schedule normalization failed",
            "metadata": {"generated_at_utc": "2025-01-01T00:00:00Z", "model": "Gemini"}
        }
