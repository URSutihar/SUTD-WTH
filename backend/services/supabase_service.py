import os
from supabase import create_client, Client
from typing import Optional, List, Dict, Any
import json

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.url or not self.service_key:
            raise ValueError("Missing Supabase configuration")
        
        self.client: Client = create_client(self.url, self.service_key)

    async def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update user profile"""
        try:
            # Check if user exists
            result = self.client.table("users").select("*").eq("id", user_data["id"]).execute()
            
            if result.data:
                # Update existing user
                update_data = {
                    "email": user_data.get("email"),
                    "name": user_data.get("name"),
                    "timezone": user_data.get("timezone", "UTC"),
                    "chronotype": user_data.get("chronotype", "intermediate"),
                    "preferences": user_data.get("preferences", {})
                }
                result = self.client.table("users").update(update_data).eq("id", user_data["id"]).execute()
            else:
                # Create new user
                result = self.client.table("users").insert(user_data).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating user profile: {e}")
            raise

    async def create_trip(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new trip"""
        try:
            result = self.client.table("trips").insert(trip_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating trip: {e}")
            raise

    async def get_trip(self, trip_id: str) -> Optional[Dict[str, Any]]:
        """Get trip by ID with schedule"""
        try:
            # Get trip
            trip_result = self.client.table("trips").select("*").eq("id", trip_id).execute()
            if not trip_result.data:
                return None
            
            trip = trip_result.data[0]
            
            # Get schedule
            schedule_result = self.client.table("schedules").select("*").eq("trip_id", trip_id).order("created_at", desc=True).limit(1).execute()
            
            if schedule_result.data:
                schedule = schedule_result.data[0]
                trip["schedule"] = schedule.get("normalized_schedule")
            
            return trip
        except Exception as e:
            print(f"Error getting trip: {e}")
            raise

    async def get_user_trips(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all trips for a user"""
        try:
            result = self.client.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting user trips: {e}")
            raise

    async def save_schedule(self, trip_id: str, raw_ai_response: Dict[str, Any], normalized_schedule: Dict[str, Any]) -> str:
        """Save AI-generated schedule"""
        try:
            schedule_data = {
                "trip_id": trip_id,
                "version": "1.0",
                "raw_ai_response": raw_ai_response,
                "normalized_schedule": normalized_schedule
            }
            
            result = self.client.table("schedules").insert(schedule_data).execute()
            return result.data[0]["id"] if result.data else None
        except Exception as e:
            print(f"Error saving schedule: {e}")
            raise

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile"""
        try:
            result = self.client.table("users").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            raise

    async def update_action_completion(self, action_id: str, completed: bool) -> bool:
        """Update action completion status by action_id (e.g., 'a1', 'a2')"""
        try:
            result = self.client.table("actions").update({"completed": completed}).eq("action_id", action_id).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f"Error updating action completion: {e}")
            raise

    async def save_actions(self, schedule_id: str, actions: List[Dict[str, Any]]) -> List[str]:
        """Save individual actions for checklist tracking"""
        try:
            action_records = []
            for action in actions:
                action_record = {
                    "schedule_id": schedule_id,
                    "action_id": action.get("action_id"),  # The action_id from the schedule
                    "day_index": action.get("day_index", 0),
                    "local_date": action.get("local_date"),
                    "action_time_local": action.get("action_time_local"),
                    "action_time_utc": action.get("action_time_utc"),
                    "type": action.get("type"),
                    "duration_minutes": action.get("duration_minutes"),
                    "details": action.get("details"),
                    "completed": action.get("completed", False)
                }
                action_records.append(action_record)
            
            result = self.client.table("actions").insert(action_records).execute()
            return [record["id"] for record in result.data] if result.data else []
        except Exception as e:
            print(f"Error saving actions: {e}")
            raise
