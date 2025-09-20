import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.models.trip import Trip
from app.models.user import Chronotype, Sensitivity

client = TestClient(pytest.app)


class TestTrips:
    def test_create_trip_success(self, db_session, test_user, auth_headers):
        """Test successful trip creation"""
        trip_data = {
            "origin": {
                "lat": 1.3521,
                "lon": 103.8198,
                "name": "Singapore",
                "iata": "SIN"
            },
            "destination": {
                "lat": 51.5072,
                "lon": -0.1276,
                "name": "London",
                "iata": "LHR"
            },
            "departure_utc": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
            "arrival_utc": (datetime.utcnow() + timedelta(days=1, hours=12)).isoformat() + "Z",
            "layovers": [],
            "user_preferences": {
                "chronotype": "neutral",
                "sensitivity": "medium",
                "preferred_bedtime_local": "23:00"
            }
        }
        
        response = client.post("/api/v1/trips/", json=trip_data, headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["user_id"] == str(test_user.id)
        assert data["origin_location"]["name"] == "Singapore"
        assert data["destination_location"]["name"] == "London"
        assert data["flight_duration_minutes"] == 720  # 12 hours
    
    def test_create_trip_without_auth(self):
        """Test trip creation without authentication"""
        trip_data = {
            "origin": {"lat": 1.3521, "lon": 103.8198, "name": "Singapore"},
            "destination": {"lat": 51.5072, "lon": -0.1276, "name": "London"},
            "departure_utc": datetime.utcnow().isoformat() + "Z",
            "arrival_utc": (datetime.utcnow() + timedelta(hours=12)).isoformat() + "Z",
            "user_preferences": {
                "chronotype": "neutral",
                "sensitivity": "medium",
                "preferred_bedtime_local": "23:00"
            }
        }
        
        response = client.post("/api/v1/trips/", json=trip_data)
        assert response.status_code == 403
    
    def test_get_trips(self, db_session, test_user, auth_headers):
        """Test getting user trips"""
        # Create a test trip
        trip = Trip(
            id=pytest.uuid.uuid4(),
            user_id=test_user.id,
            origin_timezone="Asia/Singapore",
            origin_location={"lat": 1.3521, "lon": 103.8198, "name": "Singapore"},
            destination_timezone="Europe/London",
            destination_location={"lat": 51.5072, "lon": -0.1276, "name": "London"},
            departure_utc=datetime.utcnow() + timedelta(days=1),
            arrival_utc=datetime.utcnow() + timedelta(days=1, hours=12),
            flight_duration_minutes=720
        )
        db_session.add(trip)
        db_session.commit()
        
        response = client.get("/api/v1/trips/", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["origin_location"]["name"] == "Singapore"
    
    def test_get_trip_by_id(self, db_session, test_user, auth_headers):
        """Test getting a specific trip by ID"""
        # Create a test trip
        trip = Trip(
            id=pytest.uuid.uuid4(),
            user_id=test_user.id,
            origin_timezone="Asia/Singapore",
            origin_location={"lat": 1.3521, "lon": 103.8198, "name": "Singapore"},
            destination_timezone="Europe/London",
            destination_location={"lat": 51.5072, "lon": -0.1276, "name": "London"},
            departure_utc=datetime.utcnow() + timedelta(days=1),
            arrival_utc=datetime.utcnow() + timedelta(days=1, hours=12),
            flight_duration_minutes=720
        )
        db_session.add(trip)
        db_session.commit()
        
        response = client.get(f"/api/v1/trips/{trip.id}", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == str(trip.id)
        assert data["origin_location"]["name"] == "Singapore"
    
    def test_get_nonexistent_trip(self, auth_headers):
        """Test getting a trip that doesn't exist"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/trips/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        assert "Trip not found" in response.json()["detail"]
    
    def test_delete_trip(self, db_session, test_user, auth_headers):
        """Test deleting a trip"""
        # Create a test trip
        trip = Trip(
            id=pytest.uuid.uuid4(),
            user_id=test_user.id,
            origin_timezone="Asia/Singapore",
            origin_location={"lat": 1.3521, "lon": 103.8198, "name": "Singapore"},
            destination_timezone="Europe/London",
            destination_location={"lat": 51.5072, "lon": -0.1276, "name": "London"},
            departure_utc=datetime.utcnow() + timedelta(days=1),
            arrival_utc=datetime.utcnow() + timedelta(days=1, hours=12),
            flight_duration_minutes=720
        )
        db_session.add(trip)
        db_session.commit()
        
        response = client.delete(f"/api/v1/trips/{trip.id}", headers=auth_headers)
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]
        
        # Verify trip is deleted
        response = client.get(f"/api/v1/trips/{trip.id}", headers=auth_headers)
        assert response.status_code == 404
