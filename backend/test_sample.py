#!/usr/bin/env python3
"""
Sample test data for the Jetlag Planner API
Run this script to test the /generate-plan endpoint locally
"""

import asyncio
import json
from datetime import datetime, timedelta
from models.schedule_models import GeneratePlanRequest, User, TripCreate, UserPreferences, SleepBaseline

def create_sample_request():
    """Create a sample request for testing"""
    
    # Sample user data
    user = User(
        id="test-user-123",
        email="test@example.com",
        chronotype="evening",
        sleep_baseline=SleepBaseline(
            bedtime="23:30",
            waketime="07:30",
            typical_duration_minutes=480
        )
    )
    
    # Sample trip data
    departure = datetime.utcnow() + timedelta(days=7)
    arrival = departure + timedelta(hours=15)
    
    trip = TripCreate(
        user_id="test-user-123",
        origin="Singapore",
        origin_timezone="Asia/Singapore",
        destination="Los Angeles",
        destination_timezone="America/Los_Angeles",
        departure_utc=departure,
        arrival_utc=arrival,
        flight_duration_minutes=900,
        layovers=[]
    )
    
    # Sample preferences
    preferences = UserPreferences(
        max_caffeine_mg=200,
        melatonin_preference_mg=1.0,
        avoid_medications=False
    )
    
    return GeneratePlanRequest(
        user=user,
        trip=trip,
        preferences=preferences
    )

def print_sample_request():
    """Print the sample request as JSON"""
    request = create_sample_request()
    print("Sample request for /generate-plan endpoint:")
    print("=" * 50)
    print(json.dumps(request.dict(), indent=2, default=str))
    print("=" * 50)
    print("\nTo test the API:")
    print("1. Start the backend: uvicorn main:app --reload")
    print("2. Send POST request to http://localhost:8000/api/v1/generate-plan")
    print("3. Use the JSON above as the request body")

if __name__ == "__main__":
    print_sample_request()
