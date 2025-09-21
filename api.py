from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Jetlag Planner API",
    description="API for generating personalized jet lag plans using chronobiology",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Jetlag Planner API is running",
        "version": "1.0.0"
    }

@app.post("/api/v1/generate-plan")
async def generate_plan(plan_data: dict):
    """Generate a jet lag plan"""
    try:
        # For now, return a mock response
        return {
            "success": True,
            "trip_id": "mock-trip-123",
            "plan": {
                "id": "mock-plan-123",
                "title": "Mock Jet Lag Plan",
                "description": "This is a mock plan for testing",
                "schedule": [
                    {
                        "day": 1,
                        "activities": [
                            {"time": "08:00", "activity": "Wake up", "description": "Natural wake time"},
                            {"time": "10:00", "activity": "Light exposure", "description": "Get bright light"},
                        ]
                    }
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")

@app.post("/api/v1/shift-work/generate-plan")
async def generate_shift_work_plan(plan_data: dict):
    """Generate a shift work plan"""
    try:
        return {
            "success": True,
            "id": "mock-shift-plan-123",
            "plan": {
                "id": "mock-shift-plan-123",
                "title": "Mock Shift Work Plan",
                "description": "This is a mock shift work plan for testing",
                "schedule": [
                    {
                        "day": 1,
                        "activities": [
                            {"time": "06:00", "activity": "Wake up", "description": "Early wake for shift"},
                            {"time": "07:00", "activity": "Caffeine", "description": "Light caffeine intake"},
                        ]
                    }
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating shift work plan: {str(e)}")

@app.post("/api/v1/sleep-schedule/generate-plan")
async def generate_sleep_schedule_plan(plan_data: dict):
    """Generate a sleep schedule plan"""
    try:
        return {
            "success": True,
            "id": "mock-sleep-plan-123",
            "plan": {
                "id": "mock-sleep-plan-123",
                "title": "Mock Sleep Schedule Plan",
                "description": "This is a mock sleep schedule plan for testing",
                "schedule": [
                    {
                        "day": 1,
                        "activities": [
                            {"time": "22:00", "activity": "Wind down", "description": "Start bedtime routine"},
                            {"time": "23:00", "activity": "Sleep", "description": "Target bedtime"},
                        ]
                    }
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating sleep schedule plan: {str(e)}")

@app.get("/api/v1/trips")
async def get_trips(user_id: str = None):
    """Get user trips"""
    return {"trips": []}

@app.post("/api/v1/trips")
async def create_trip(trip_data: dict):
    """Create a new trip"""
    try:
        return {
            "success": True,
            "trip": {
                "id": "mock-trip-123",
                "destination": trip_data.get("destination", "Unknown"),
                "departure_date": trip_data.get("departure_date", "2024-01-01"),
                "arrival_date": trip_data.get("arrival_date", "2024-01-02"),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating trip: {str(e)}")

@app.get("/api/v1/trips/{trip_id}")
async def get_trip(trip_id: str):
    """Get a specific trip"""
    return {
        "id": trip_id,
        "destination": "Mock Destination",
        "departure_date": "2024-01-01",
        "arrival_date": "2024-01-02",
        "plan": {
            "id": "mock-plan-123",
            "schedule": []
        }
    }

@app.get("/api/v1/plans/all")
async def get_all_plans(user_id: str):
    """Get all plans for a user"""
    return {"plans": []}

@app.get("/api/v1/shift-work/plans")
async def get_shift_work_plans(user_id: str):
    """Get shift work plans for a user"""
    return {"plans": []}

@app.get("/api/v1/shift-work/plans/{plan_id}")
async def get_shift_work_plan(plan_id: str):
    """Get a specific shift work plan"""
    return {
        "id": plan_id,
        "title": "Mock Shift Work Plan",
        "description": "This is a mock shift work plan for testing",
        "current_schedule": {
            "bedtime": "23:00",
            "waketime": "07:00",
            "sleepDuration": "8h 0m"
        },
        "desired_schedule": {
            "bedtime": "22:00",
            "waketime": "06:00",
            "sleepDuration": "8h 0m"
        },
        "shift_details": {
            "shiftType": "night",
            "workStartTime": "22:00",
            "workEndTime": "06:00"
        },
        "schedule": [
            {
                "day": 1,
                "activities": [
                    {"time": "06:00", "activity": "Wake up", "description": "Early wake for shift"},
                    {"time": "07:00", "activity": "Caffeine", "description": "Light caffeine intake"},
                    {"time": "22:00", "activity": "Start shift", "description": "Begin work"},
                    {"time": "02:00", "activity": "Break", "description": "Take a break"},
                    {"time": "06:00", "activity": "End shift", "description": "Finish work"},
                    {"time": "07:00", "activity": "Sleep", "description": "Go to bed"}
                ]
            }
        ]
    }

@app.get("/api/v1/sleep-schedule/plans")
async def get_sleep_schedule_plans(user_id: str):
    """Get sleep schedule plans for a user"""
    return {"plans": []}

@app.get("/api/v1/sleep-schedule/plans/{plan_id}")
async def get_sleep_schedule_plan(plan_id: str):
    """Get a specific sleep schedule plan"""
    return {
        "id": plan_id,
        "title": "Mock Sleep Schedule Plan",
        "description": "This is a mock sleep schedule plan for testing",
        "current_schedule": {
            "bedtime": "01:00",
            "waketime": "09:00",
            "sleepDuration": "8h 0m"
        },
        "desired_schedule": {
            "bedtime": "23:00",
            "waketime": "07:00",
            "sleepDuration": "8h 0m"
        },
        "sleep_issues": {
            "difficultyFallingAsleep": True,
            "difficultyStayingAsleep": False,
            "earlyMorningAwakening": False,
            "irregularSchedule": True,
            "jetLag": False,
            "shiftWork": False
        },
        "preferences": {
            "chronotype": "night_owl",
            "lightSensitivity": "moderate",
            "caffeineIntake": "moderate"
        },
        "schedule": [
            {
                "day": 1,
                "activities": [
                    {"time": "22:00", "activity": "Wind down", "description": "Start bedtime routine"},
                    {"time": "23:00", "activity": "Sleep", "description": "Target bedtime"},
                    {"time": "07:00", "activity": "Wake up", "description": "Target wake time"},
                    {"time": "08:00", "activity": "Light exposure", "description": "Get bright light"}
                ]
            }
        ]
    }

@app.post("/api/v1/checklist/mark")
async def mark_action_complete(action_data: dict):
    """Mark an action as complete"""
    return {"success": True, "action_id": action_data.get("action_id"), "completed": action_data.get("completed")}

@app.get("/api/v1/weather")
async def get_weather(lat: float = None, lon: float = None, q: str = None):
    """Get weather information"""
    return {
        "temperature": 22,
        "condition": "Sunny",
        "humidity": 60,
        "description": "Mock weather data"
    }

@app.get("/api/v1/flight-lookup/{flight_number}")
async def lookup_flight(flight_number: str, date: str = None):
    """Lookup flight information"""
    return {
        "flight_number": flight_number,
        "airline": "Mock Airline",
        "departure": "Mock Airport",
        "arrival": "Mock Airport",
        "status": "On Time"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if os.getenv("ENVIRONMENT") == "development" else "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
