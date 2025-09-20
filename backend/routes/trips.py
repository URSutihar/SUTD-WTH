from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.trip_models import TripCreate, TripResponse, TripListResponse
from services.supabase_service import SupabaseService

router = APIRouter()

@router.post("/trips", response_model=TripResponse)
async def create_trip(trip: TripCreate):
    """Create a new trip"""
    try:
        supabase = SupabaseService()
        
        trip_data = {
            "user_id": trip.user_id,
            "origin": trip.origin,
            "origin_timezone": trip.origin_timezone,
            "destination": trip.destination,
            "destination_timezone": trip.destination_timezone,
            "departure_utc": trip.departure_utc.isoformat(),
            "arrival_utc": trip.arrival_utc.isoformat(),
            "flight_duration_minutes": trip.flight_duration_minutes,
            "layovers": [layover.dict() for layover in trip.layovers]
        }
        
        result = await supabase.create_trip(trip_data)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create trip")
        
        return TripResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trips", response_model=TripListResponse)
async def get_trips(user_id: str = Query(..., description="User ID")):
    """Get all trips for a user"""
    try:
        supabase = SupabaseService()
        trips = await supabase.get_user_trips(user_id)
        
        return TripListResponse(
            trips=[TripResponse(**trip) for trip in trips],
            total=len(trips)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trips/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str):
    """Get a specific trip by ID"""
    try:
        supabase = SupabaseService()
        trip = await supabase.get_trip(trip_id)
        
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        return TripResponse(**trip)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
