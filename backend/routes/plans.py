from fastapi import APIRouter, HTTPException
from models.schedule_models import GeneratePlanRequest, ScheduleResponse
from services.supabase_service import SupabaseService
from services.gemini_service import GeminiService
from services.weather_service import WeatherService
import json
from datetime import datetime

router = APIRouter()

@router.post("/generate-plan", response_model=ScheduleResponse)
async def generate_plan(request: GeneratePlanRequest):
    """Generate a personalized jet lag plan using AI"""
    try:
        # Initialize services
        supabase = SupabaseService()
        gemini = GeminiService()
        weather = WeatherService()
        
        # Get weather data for destination
        weather_data = None
        try:
            weather_data = await weather.get_weather_by_city(request.trip.get("destination"))
        except Exception as e:
            print(f"Warning: Could not fetch weather data: {e}")
        
        # Get user profile from database
        user_profile = await supabase.get_user_profile(request.user.get("id"))
        if not user_profile:
            # Create user profile if it doesn't exist
            user_data = {
                "id": request.user.get("id"),
                "email": request.user.get("email"),
                "name": request.user.get("email"),
                "timezone": "UTC",
                "chronotype": request.user.get("chronotype", "intermediate"),
                "preferences": request.user.get("preferences", {})
            }
            await supabase.create_user_profile(user_data)
            user_profile = user_data
        
        # Prepare data for Gemini
        user_data = {
            "id": request.user.get("id"),
            "email": request.user.get("email"),
            "chronotype": user_profile.get("chronotype", "intermediate"),
            "sleep_baseline": user_profile.get("sleep_baseline"),
            "preferences": user_profile.get("preferences", {})
        }
        
        # First, create the trip in the database to get a proper UUID
        trip_data_for_db = {
            "user_id": request.trip.get("user_id"),
            "origin": request.trip.get("origin"),
            "origin_timezone": request.trip.get("origin_timezone"),
            "destination": request.trip.get("destination"),
            "destination_timezone": request.trip.get("destination_timezone"),
            "departure_utc": request.trip.get("departure_utc"),
            "arrival_utc": request.trip.get("arrival_utc"),
            "flight_duration_minutes": request.trip.get("flight_duration_minutes"),
            "layovers": request.trip.get("layovers", [])
        }
        
        # Create trip in database
        created_trip = await supabase.create_trip(trip_data_for_db)
        if not created_trip:
            raise HTTPException(status_code=500, detail="Failed to create trip")
        
        trip_id = created_trip["id"]
        print(f"Created trip with ID: {trip_id}")
        
        # Prepare trip data for Gemini (with the actual trip ID)
        trip_data = {
            "id": trip_id,
            "origin": request.trip.get("origin"),
            "origin_timezone": request.trip.get("origin_timezone"),
            "destination": request.trip.get("destination"),
            "destination_timezone": request.trip.get("destination_timezone"),
            "departure_utc": request.trip.get("departure_utc"),
            "arrival_utc": request.trip.get("arrival_utc"),
            "flight_duration_minutes": request.trip.get("flight_duration_minutes"),
            "layovers": request.trip.get("layovers", [])
        }
        
        # Generate plan using Gemini
        ai_response = await gemini.generate_jetlag_plan(user_data, trip_data, weather_data)
        
        # Validate and normalize the response
        normalized_schedule = _normalize_schedule(ai_response, trip_id)
        print(f"Normalized schedule keys: {list(normalized_schedule.keys())}")
        print(f"Normalized schedule: {normalized_schedule}")
        
        # Save to database
        schedule_id = await supabase.save_schedule(
            trip_id,
            ai_response,
            normalized_schedule
        )
        
        # Save individual actions for checklist tracking
        # Temporarily disabled until database migration is complete
        # actions = _extract_actions(normalized_schedule)
        # if actions:
        #     await supabase.save_actions(schedule_id, actions)
        
        print(f"Creating ScheduleResponse with: {normalized_schedule}")
        
        # Add trip_id to the response for frontend navigation
        response_data = normalized_schedule.copy()
        response_data["trip_id"] = trip_id
        
        return ScheduleResponse(**response_data)
        
    except Exception as e:
        import traceback
        print(f"Error generating plan: {e}")
        print(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")

def _normalize_schedule(ai_response: dict, trip_id: str) -> dict:
    """Normalize and validate the AI response"""
    try:
        # Ensure required fields exist
        normalized = {
            "schedule_version": ai_response.get("schedule_version", "1.0"),
            "trip_id": trip_id,
            "timezone": ai_response.get("timezone", "UTC"),
            "phases": ai_response.get("phases", []),
            "disclaimer": ai_response.get("disclaimer", "This app provides guidance only. Consult a physician before taking melatonin or making major changes to sleep medication."),
            "metadata": {
                "generated_at_utc": datetime.utcnow().isoformat() + "Z",
                "model": ai_response.get("metadata", {}).get("model", "Gemini")
            }
        }
        
        # Validate phases
        for phase in normalized["phases"]:
            if "actions" not in phase:
                phase["actions"] = []
            
            # Normalize phase names to match model constraints
            phase_name = phase.get("phase_name", "").lower()
            if "pre-trip" in phase_name or "pre" in phase_name:
                phase["phase_name"] = "pre-trip"
            elif "travel" in phase_name or "flight" in phase_name:
                phase["phase_name"] = "travel"
            elif "post-arrival" in phase_name or "post" in phase_name or "arrival" in phase_name:
                phase["phase_name"] = "post-arrival"
            else:
                # Default to travel if unclear
                phase["phase_name"] = "travel"
            
            # Ensure each action has required fields
            for action in phase["actions"]:
                if "action_id" not in action:
                    action["action_id"] = f"action-{hash(action.get('details', '')) % 10000}"
                if "dose_mg" not in action:
                    action["dose_mg"] = None
                if "safety_notes" not in action:
                    action["safety_notes"] = None
        
        return normalized
        
    except Exception as e:
        print(f"Error normalizing schedule: {e}")
        # Return a basic fallback schedule
        return {
            "schedule_version": "1.0",
            "trip_id": trip_id,
            "timezone": "UTC",
            "phases": [],
            "disclaimer": "This app provides guidance only. Consult a physician before taking melatonin or making major changes to sleep medication.",
            "metadata": {
                "generated_at_utc": datetime.utcnow().isoformat() + "Z",
                "model": "Gemini"
            }
        }

def _extract_actions(schedule: dict) -> list:
    """Extract individual actions for checklist tracking"""
    actions = []
    
    for phase in schedule.get("phases", []):
        for i, action in enumerate(phase.get("actions", [])):
            action_record = {
                "action_id": action.get("action_id"),  # Include the action_id from the schedule
                "day_index": i,
                "local_date": action.get("when_local", "").split("T")[0] if action.get("when_local") else None,
                "action_time_local": action.get("when_local", "").split("T")[1] if action.get("when_local") and "T" in action.get("when_local") else None,
                "action_time_utc": action.get("when_utc"),
                "type": action.get("type"),
                "duration_minutes": action.get("duration_minutes"),
                "details": action.get("details"),
                "completed": False
            }
            actions.append(action_record)
    
    return actions
