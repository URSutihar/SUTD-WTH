from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from models import *
from services.supabase_service import SupabaseService
from services.gemini_service import GeminiService
from services.weather_service import WeatherService
from routes import trips, plans, checklist, weather, shift_work, sleep_schedule

# Environment variables
load_dotenv()

app = FastAPI(
    title="Jetlag Planner API",
    description="API for generating personalized jet lag plans using chronobiology",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://*.vercel.app",  # Allow all Vercel preview deployments
        "https://sutihar.com",  # Your production domain
        "https://www.sutihar.com"  # Your production domain with www
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
supabase_service = SupabaseService()
gemini_service = GeminiService()
weather_service = WeatherService()

# Include routers
app.include_router(trips.router, prefix="/api/v1", tags=["trips"])
app.include_router(plans.router, prefix="/api/v1", tags=["plans"])
app.include_router(checklist.router, prefix="/api/v1", tags=["checklist"])
app.include_router(weather.router, prefix="/api/v1", tags=["weather"])
app.include_router(shift_work.router, tags=["shift-work"])
app.include_router(sleep_schedule.router, tags=["sleep-schedule"])

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Jetlag Planner API is running",
        "version": "1.0.0"
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
