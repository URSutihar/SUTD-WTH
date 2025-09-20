import os
import httpx
from typing import Dict, Any, Optional

class FlightLookupService:
    def __init__(self):
        self.api_key = os.getenv("AVIATIONSTACK_API_KEY")
        if not self.api_key:
            print("Warning: AVIATIONSTACK_API_KEY not found. Flight lookup will not work.")
        
        self.base_url = "http://api.aviationstack.com/v1"

    async def lookup_flight(self, flight_number: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Look up flight information by flight number"""
        
        if not self.api_key:
            raise ValueError("AviationStack API key not configured")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                params = {
                    "access_key": self.api_key,
                    "flight_iata": flight_number.upper(),
                }
                
                if date:
                    params["flight_date"] = date
                
                response = await client.get(
                    f"{self.base_url}/flights",
                    params=params
                )
                
                if response.status_code != 200:
                    raise Exception(f"AviationStack API error: {response.status_code} - {response.text}")
                
                data = response.json()
                
                if not data.get("data") or len(data["data"]) == 0:
                    raise Exception(f"No flight data found for {flight_number}")
                
                # Get the first flight from the results
                flight_data = data["data"][0]
                
                # Extract relevant information
                flight_info = {
                    "flight_number": flight_data.get("flight", {}).get("iata", flight_number),
                    "airline": flight_data.get("airline", {}).get("name", "Unknown"),
                    "aircraft": flight_data.get("aircraft", {}).get("iata", "Unknown"),
                    "departure": {
                        "airport": flight_data.get("departure", {}).get("airport", "Unknown"),
                        "iata": flight_data.get("departure", {}).get("iata", "Unknown"),
                        "scheduled": flight_data.get("departure", {}).get("scheduled", ""),
                        "terminal": flight_data.get("departure", {}).get("terminal"),
                        "gate": flight_data.get("departure", {}).get("gate"),
                        "timezone": flight_data.get("departure", {}).get("timezone")
                    },
                    "arrival": {
                        "airport": flight_data.get("arrival", {}).get("airport", "Unknown"),
                        "iata": flight_data.get("arrival", {}).get("iata", "Unknown"),
                        "scheduled": flight_data.get("arrival", {}).get("scheduled", ""),
                        "terminal": flight_data.get("arrival", {}).get("terminal"),
                        "gate": flight_data.get("arrival", {}).get("gate"),
                        "timezone": flight_data.get("arrival", {}).get("timezone")
                    },
                    "status": flight_data.get("flight_status", "Unknown"),
                    "duration": flight_data.get("flight", {}).get("number", ""),
                    "date": flight_data.get("flight_date", "")
                }
                
                return flight_info
                
        except Exception as e:
            print(f"Error looking up flight {flight_number}: {e}")
            raise Exception(f"Failed to lookup flight {flight_number}: {str(e)}")

    def _parse_flight_time(self, time_str: str) -> Dict[str, str]:
        """Parse flight time string into date and time components"""
        if not time_str:
            return {"date": "", "time": ""}
        
        try:
            # Parse ISO format datetime
            from datetime import datetime
            dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
            return {
                "date": dt.strftime("%Y-%m-%d"),
                "time": dt.strftime("%H:%M")
            }
        except:
            return {"date": "", "time": ""}

# Create a singleton instance
flight_lookup_service = FlightLookupService()
