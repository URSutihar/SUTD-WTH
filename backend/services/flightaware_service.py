import os
import httpx
from typing import Dict, Any, Optional

class FlightAwareService:
    def __init__(self):
        self.api_key = os.getenv("FLIGHTAWARE_API_KEY")
        if not self.api_key:
            print("Warning: FLIGHTAWARE_API_KEY not found. FlightAware lookup will not work.")
        
        self.base_url = "https://aeroapi.flightaware.com/aeroapi"

    async def lookup_flight(self, flight_number: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Look up flight information by flight number using FlightAware AeroAPI"""
        
        if not self.api_key:
            raise ValueError("Flight lookup is not available. FlightAware API key not configured. Please enter your trip details manually.")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "x-apikey": self.api_key
                }
                
                # FlightAware uses different endpoint structure
                url = f"{self.base_url}/flights/{flight_number.upper()}"
                
                if date:
                    url += f"?start={date}T00:00:00Z&end={date}T23:59:59Z"
                
                response = await client.get(url, headers=headers)
                
                if response.status_code != 200:
                    error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                    error_message = error_data.get('message', response.text)
                    
                    if response.status_code == 401:
                        raise Exception(f"FlightAware API authentication failed. Please check your API key.")
                    elif response.status_code == 403:
                        raise Exception(f"Flight lookup is not available with your current FlightAware subscription plan. Please enter your trip details manually.")
                    elif response.status_code == 404:
                        raise Exception(f"No flight data found for {flight_number}")
                    else:
                        raise Exception(f"FlightAware API error: {response.status_code} - {error_message}")
                
                data = response.json()
                
                if not data.get("flights") or len(data["flights"]) == 0:
                    raise Exception(f"No flight data found for {flight_number}")
                
                # Get the first flight from the results
                flight_data = data["flights"][0]
                
                # Extract relevant information (FlightAware has different structure)
                flight_info = {
                    "flight_number": flight_data.get("ident", flight_number),
                    "airline": flight_data.get("operator", "Unknown"),
                    "aircraft": flight_data.get("aircraft_type", "Unknown"),
                    "departure": {
                        "airport": flight_data.get("origin", {}).get("name", "Unknown"),
                        "iata": flight_data.get("origin", {}).get("code", "Unknown"),
                        "scheduled": flight_data.get("scheduled_out", ""),
                        "terminal": flight_data.get("origin", {}).get("terminal"),
                        "gate": flight_data.get("origin", {}).get("gate"),
                        "timezone": flight_data.get("origin", {}).get("timezone")
                    },
                    "arrival": {
                        "airport": flight_data.get("destination", {}).get("name", "Unknown"),
                        "iata": flight_data.get("destination", {}).get("code", "Unknown"),
                        "scheduled": flight_data.get("scheduled_in", ""),
                        "terminal": flight_data.get("destination", {}).get("terminal"),
                        "gate": flight_data.get("destination", {}).get("gate"),
                        "timezone": flight_data.get("destination", {}).get("timezone")
                    },
                    "status": flight_data.get("status", "Unknown"),
                    "duration": flight_data.get("duration", ""),
                    "date": flight_data.get("scheduled_out", "").split("T")[0] if flight_data.get("scheduled_out") else ""
                }
                
                return flight_info
                
        except Exception as e:
            print(f"FlightAware lookup error: {e}")
            raise

# Create a singleton instance
flightaware_service = FlightAwareService()
