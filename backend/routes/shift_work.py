from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import ShiftWorkPlanCreate, ShiftWorkPlanResponse
from services.supabase_service import SupabaseService
from services.gemini_service import GeminiService

router = APIRouter(
    prefix="/api/v1/shift-work",
    tags=["shift-work"]
)

# Dependency to get SupabaseService instance
def get_supabase_service():
    return SupabaseService()

@router.post("/generate-plan", response_model=ShiftWorkPlanResponse)
async def generate_shift_work_plan(
    request: ShiftWorkPlanCreate,
    supabase: SupabaseService = Depends(get_supabase_service)
):
    """Create a new shift work plan and generate a plan."""
    try:
        # Use demo user ID if not provided
        plan_data = request.dict()
        if not plan_data.get('user_id'):
            plan_data['user_id'] = '00000000-0000-0000-0000-000000000001'  # Valid UUID format
        
        # Create the shift work plan in the database
        created_plan = await supabase.create_shift_work_plan(plan_data)
        if not created_plan:
            raise HTTPException(status_code=500, detail="Failed to create shift work plan")

        plan_id = created_plan["id"]
        print(f"Created shift work plan with ID: {plan_id}")

        # Generate AI plan using Gemini
        try:
            gemini_service = GeminiService()
            
            # Prepare user data (similar to trip plans)
            user_data = {
                "id": plan_data['user_id'],
                "chronotype": "intermediate",  # This should come from user profile
                "sleep_baseline": {
                    "bedtime": request.current_schedule.get('bedtime', '23:00'),
                    "waketime": request.current_schedule.get('waketime', '07:00'),
                    "typical_duration_minutes": 480  # Default 8 hours
                }
            }
            
            # Prepare shift work data
            shift_work_data = {
                "id": plan_id,
                "current_schedule": request.current_schedule,
                "desired_schedule": request.desired_schedule,
                "shift_details": request.shift_details,
                "preferences": request.preferences
            }
            
            # Generate the AI plan
            ai_response = await gemini_service.generate_shift_work_plan(user_data, shift_work_data)
            print(f"Generated AI response for shift work plan: {ai_response.get('plan_type', 'unknown')}")
            
            # Normalize the schedule (similar to trip plans)
            normalized_schedule = _normalize_shift_work_schedule(ai_response, plan_id)
            
            # Save the schedule
            await supabase.save_schedule_generic(
                plan_type="shift_work",
                plan_id=plan_id,
                raw_ai_response=ai_response,
                normalized_schedule=normalized_schedule
            )
            
            return ShiftWorkPlanResponse(**created_plan, schedule=normalized_schedule)
            
        except Exception as ai_error:
            print(f"AI generation failed, using placeholder: {ai_error}")
            
            # Fallback to placeholder if AI fails
            placeholder_schedule = {
                "schedule_version": "1.0",
                "plan_type": "shift_work_adaptation",
                "plan_id": plan_id,
                "timezone": "UTC",
                "phases": [
                    {
                        "phase_name": "preparation",
                        "start_local": "2025-01-01T00:00:00Z",
                        "end_local": "2025-01-03T23:59:59Z",
                        "actions": [
                            {
                                "action_id": "a1",
                                "type": "light",
                                "when_local": "2025-01-01T07:00:00Z",
                                "when_utc": "2025-01-01T07:00:00Z",
                                "duration_minutes": 30,
                                "priority": "high",
                                "details": "Get morning light exposure to prepare for shift work",
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
                plan_type="shift_work",
                plan_id=plan_id,
                raw_ai_response={"message": "AI integration failed, using placeholder"},
                normalized_schedule=placeholder_schedule
            )

            return ShiftWorkPlanResponse(**created_plan, schedule=placeholder_schedule)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans", response_model=List[ShiftWorkPlanResponse])
async def get_shift_work_plans(
    user_id: str,
    supabase: SupabaseService = Depends(get_supabase_service)
):
    """Get all shift work plans for a user."""
    try:
        plans = await supabase.get_user_shift_work_plans(user_id)
        return plans
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans/{plan_id}", response_model=ShiftWorkPlanResponse)
async def get_shift_work_plan(
    plan_id: str,
    supabase: SupabaseService = Depends(get_supabase_service)
):
    """Get a single shift work plan by ID."""
    try:
        plan = await supabase.get_shift_work_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Shift work plan not found")
        return plan
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _normalize_shift_work_schedule(ai_response: dict, plan_id: str) -> dict:
    """Normalize AI response for shift work schedule"""
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
        print(f"Error normalizing shift work schedule: {e}")
        # Return a basic structure if normalization fails
        return {
            "schedule_version": "1.0",
            "plan_type": "shift_work_adaptation",
            "plan_id": plan_id,
            "timezone": "UTC",
            "phases": [],
            "disclaimer": "Schedule normalization failed",
            "metadata": {"generated_at_utc": "2025-01-01T00:00:00Z", "model": "Gemini"}
        }
