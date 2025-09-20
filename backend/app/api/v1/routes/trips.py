from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.trip import Trip
from app.models.user import User
from app.schemas.trip import TripCreate, TripResponse, TripUpdate
from app.core.security import get_current_user
import uuid

router = APIRouter()


@router.post("/", response_model=TripResponse)
async def create_trip(
    trip_data: TripCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trip"""
    try:
        # Calculate flight duration
        flight_duration = trip_data.arrival_utc - trip_data.departure_utc
        flight_duration_minutes = int(flight_duration.total_seconds() / 60)
        
        # Create trip
        trip = Trip(
            id=uuid.uuid4(),
            user_id=current_user["id"],
            origin_timezone=trip_data.origin.timezone if hasattr(trip_data.origin, 'timezone') else "UTC",
            origin_location={
                "lat": trip_data.origin.lat,
                "lon": trip_data.origin.lon,
                "name": trip_data.origin.name,
                "iata": trip_data.origin.iata
            },
            destination_timezone=trip_data.destination.timezone if hasattr(trip_data.destination, 'timezone') else "UTC",
            destination_location={
                "lat": trip_data.destination.lat,
                "lon": trip_data.destination.lon,
                "name": trip_data.destination.name,
                "iata": trip_data.destination.iata
            },
            departure_utc=trip_data.departure_utc,
            arrival_utc=trip_data.arrival_utc,
            layovers=[layover.dict() for layover in trip_data.layovers],
            flight_duration_minutes=flight_duration_minutes
        )
        
        db.add(trip)
        db.commit()
        db.refresh(trip)
        
        return trip
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create trip: {str(e)}"
        )


@router.get("/", response_model=List[TripResponse])
async def get_trips(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all trips for the current user"""
    trips = db.query(Trip).filter(Trip.user_id == current_user["id"]).all()
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific trip"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["id"]
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    trip_data: TripUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a trip"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["id"]
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    # Update fields
    if trip_data.origin:
        trip.origin_location = {
            "lat": trip_data.origin.lat,
            "lon": trip_data.origin.lon,
            "name": trip_data.origin.name,
            "iata": trip_data.origin.iata
        }
        if hasattr(trip_data.origin, 'timezone'):
            trip.origin_timezone = trip_data.origin.timezone
    
    if trip_data.destination:
        trip.destination_location = {
            "lat": trip_data.destination.lat,
            "lon": trip_data.destination.lon,
            "name": trip_data.destination.name,
            "iata": trip_data.destination.iata
        }
        if hasattr(trip_data.destination, 'timezone'):
            trip.destination_timezone = trip_data.destination.timezone
    
    if trip_data.departure_utc:
        trip.departure_utc = trip_data.departure_utc
    
    if trip_data.arrival_utc:
        trip.arrival_utc = trip_data.arrival_utc
        # Recalculate flight duration
        flight_duration = trip.arrival_utc - trip.departure_utc
        trip.flight_duration_minutes = int(flight_duration.total_seconds() / 60)
    
    if trip_data.layovers is not None:
        trip.layovers = [layover.dict() for layover in trip_data.layovers]
    
    db.commit()
    db.refresh(trip)
    
    return trip


@router.delete("/{trip_id}")
async def delete_trip(
    trip_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a trip"""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user["id"]
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found"
        )
    
    db.delete(trip)
    db.commit()
    
    return {"message": "Trip deleted successfully"}
