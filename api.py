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

@app.get("/api/v1/trips")
async def get_trips():
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
