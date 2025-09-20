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

    async def update_trip(self, trip_id: str, trip_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing trip"""
        try:
            result = self.client.table("trips").update(trip_data).eq("id", trip_id).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error updating trip: {e}")
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

    async def get_user_all_plans(self, user_id: str) -> Dict[str, Any]:
        """Get all plans (trips, shift work, sleep schedule) for a user"""
        try:
            # Get trips
            trips_result = self.client.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            trips = trips_result.data or []
            
            # Get shift work plans (with error handling for missing table)
            shift_work_plans = []
            try:
                shift_work_result = self.client.table("shift_work_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                shift_work_plans = shift_work_result.data or []
            except Exception as e:
                print(f"Warning: shift_work_plans table not found: {e}")
                shift_work_plans = []
            
            # Get sleep schedule plans (with error handling for missing table)
            sleep_schedule_plans = []
            try:
                sleep_schedule_result = self.client.table("sleep_schedule_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                sleep_schedule_plans = sleep_schedule_result.data or []
            except Exception as e:
                print(f"Warning: sleep_schedule_plans table not found: {e}")
                sleep_schedule_plans = []
            
            # Format all plans with unified structure
            all_plans = []
            
            # Add trips
            for trip in trips:
                all_plans.append({
                    "id": trip["id"],
                    "type": "trip",
                    "title": f"{trip['origin']} → {trip['destination']}",
                    "subtitle": "Jet Lag Prevention",
                    "created_at": trip["created_at"],
                    "status": trip.get("status", "planned"),
                    "data": trip
                })
            
            # Add shift work plans
            for plan in shift_work_plans:
                shift_details = plan.get("shift_details", {})
                shift_type = shift_details.get("shiftType", "unknown")
                work_start = shift_details.get("workStartTime", "unknown")
                work_end = shift_details.get("workEndTime", "unknown")
                
                all_plans.append({
                    "id": plan["id"],
                    "type": "shift_work",
                    "title": f"{shift_type.title()} Shift Adaptation",
                    "subtitle": f"{work_start} - {work_end} Schedule",
                    "created_at": plan["created_at"],
                    "status": "active",  # Default status for shift work
                    "data": plan
                })
            
            # Add sleep schedule plans
            for plan in sleep_schedule_plans:
                current_schedule = plan.get("current_schedule", {})
                desired_schedule = plan.get("desired_schedule", {})
                current_bedtime = current_schedule.get("bedtime", "unknown")
                desired_bedtime = desired_schedule.get("bedtime", "unknown")
                
                all_plans.append({
                    "id": plan["id"],
                    "type": "sleep_schedule",
                    "title": "Sleep Schedule Adjustment",
                    "subtitle": f"{current_bedtime} → {desired_bedtime}",
                    "created_at": plan["created_at"],
                    "status": "in_progress",  # Default status for sleep schedule
                    "data": plan
                })
            
            # Sort all plans by created_at (newest first)
            all_plans.sort(key=lambda x: x["created_at"], reverse=True)
            
            return {
                "plans": all_plans,
                "total": len(all_plans),
                "trips_count": len(trips),
                "shift_work_count": len(shift_work_plans),
                "sleep_schedule_count": len(sleep_schedule_plans)
            }
        except Exception as e:
            print(f"Error getting user all plans: {e}")
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

    # Shift Work Plans methods
    async def create_shift_work_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new shift work plan"""
        try:
            result = self.client.table("shift_work_plans").insert(plan_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating shift work plan: {e}")
            raise

    async def get_shift_work_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Get shift work plan by ID with schedule"""
        try:
            # Get plan
            plan_result = self.client.table("shift_work_plans").select("*").eq("id", plan_id).execute()
            if not plan_result.data:
                return None
            
            plan = plan_result.data[0]
            
            # Get schedule
            schedule_result = self.client.table("schedules").select("*").eq("plan_id", plan_id).eq("plan_type", "shift_work").order("created_at", desc=True).limit(1).execute()
            
            if schedule_result.data:
                schedule = schedule_result.data[0]
                plan["schedule"] = schedule.get("normalized_schedule")
            
            return plan
        except Exception as e:
            print(f"Error getting shift work plan: {e}")
            raise

    async def get_user_shift_work_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all shift work plans for a user"""
        try:
            result = self.client.table("shift_work_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting user shift work plans: {e}")
            raise

    # Sleep Schedule Plans methods
    async def create_sleep_schedule_plan(self, plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new sleep schedule plan"""
        try:
            result = self.client.table("sleep_schedule_plans").insert(plan_data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error creating sleep schedule plan: {e}")
            raise

    async def get_sleep_schedule_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Get sleep schedule plan by ID with schedule"""
        try:
            # Get plan
            plan_result = self.client.table("sleep_schedule_plans").select("*").eq("id", plan_id).execute()
            if not plan_result.data:
                return None
            
            plan = plan_result.data[0]
            
            # Get schedule
            schedule_result = self.client.table("schedules").select("*").eq("plan_id", plan_id).eq("plan_type", "sleep_schedule").order("created_at", desc=True).limit(1).execute()
            
            if schedule_result.data:
                schedule = schedule_result.data[0]
                plan["schedule"] = schedule.get("normalized_schedule")
            
            return plan
        except Exception as e:
            print(f"Error getting sleep schedule plan: {e}")
            raise

    async def get_user_sleep_schedule_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all sleep schedule plans for a user"""
        try:
            result = self.client.table("sleep_schedule_plans").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return result.data or []
        except Exception as e:
            print(f"Error getting user sleep schedule plans: {e}")
            raise

    # Updated schedule methods to handle all plan types
    async def save_schedule_generic(self, plan_type: str, plan_id: str, raw_ai_response: Dict[str, Any], normalized_schedule: Dict[str, Any]) -> str:
        """Save AI-generated schedule for any plan type"""
        try:
            schedule_data = {
                "plan_type": plan_type,
                "plan_id": plan_id,
                "version": "1.0",
                "raw_ai_response": raw_ai_response,
                "normalized_schedule": normalized_schedule
            }
            
            # For backward compatibility, also set trip_id if it's a trip plan
            if plan_type == "trip":
                schedule_data["trip_id"] = plan_id
            
            result = self.client.table("schedules").insert(schedule_data).execute()
            return result.data[0]["id"] if result.data else None
        except Exception as e:
            print(f"Error saving schedule: {e}")
            raise
