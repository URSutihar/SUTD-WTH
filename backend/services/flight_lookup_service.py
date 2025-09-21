import os
import httpx
from typing import Dict, Any, Optional

class FlightLookupService:
    def __init__(self):
        self.aviationstack_key = os.getenv("AVIATIONSTACK_API_KEY")
        self.flightaware_key = os.getenv("FLIGHTAWARE_API_KEY")
        
        if not self.aviationstack_key and not self.flightaware_key:
            print("Warning: No flight lookup API keys found. Flight lookup will not work.")
        
        self.aviationstack_url = "http://api.aviationstack.com/v1"
        self.flightaware_url = "https://aeroapi.flightaware.com/aeroapi"

    async def lookup_flight(self, flight_number: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Look up flight information by flight number with fallback to multiple APIs"""
        
        if not self.aviationstack_key and not self.flightaware_key:
            raise ValueError("Flight lookup is not available. No API keys configured. Please enter your trip details manually.")
        
        # Try FlightAware first (better free tier)
        if self.flightaware_key:
            try:
                return await self._lookup_flightaware(flight_number, date)
            except Exception as e:
                print(f"FlightAware lookup failed: {e}")
                # Fall back to AviationStack if available
        
        # Try AviationStack as fallback
        if self.aviationstack_key:
            try:
                return await self._lookup_aviationstack(flight_number, date)
            except Exception as e:
                print(f"AviationStack lookup failed: {e}")
        
        # If both fail, raise the most recent error
        raise ValueError("All flight lookup services failed. Please enter your trip details manually.")
    
    async def _lookup_flightaware(self, flight_number: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Look up flight using FlightAware AeroAPI"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            headers = {
                "x-apikey": self.flightaware_key
            }
            
            url = f"{self.flightaware_url}/flights/{flight_number.upper()}"
            if date:
                url += f"?start={date}T00:00:00Z&end={date}T23:59:59Z"
            
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                error_message = error_data.get('message', response.text)
                
                if response.status_code == 401:
                    raise Exception(f"FlightAware API authentication failed. Please check your API key.")
                elif response.status_code == 403:
                    raise Exception(f"Flight lookup is not available with your current FlightAware subscription plan.")
                elif response.status_code == 404:
                    raise Exception(f"No flight data found for {flight_number}")
                else:
                    raise Exception(f"FlightAware API error: {response.status_code} - {error_message}")
            
            data = response.json()
            
            if not data.get("flights") or len(data["flights"]) == 0:
                raise Exception(f"No flight data found for {flight_number}")
            
            # Get the first flight from the results
            flight_data = data["flights"][0]
            
            # Extract relevant information (FlightAware structure)
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
    
    async def _lookup_aviationstack(self, flight_number: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Look up flight using AviationStack API"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "access_key": self.aviationstack_key,
                "flight_iata": flight_number.upper(),
            }
            
            if date:
                params["flight_date"] = date
            
            response = await client.get(
                f"{self.aviationstack_url}/flights",
                params=params
            )
            
            if response.status_code != 200:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                error_message = error_data.get('error', {}).get('message', response.text)
                
                if response.status_code == 403:
                    raise Exception(f"Flight lookup is not available with your current AviationStack subscription plan.")
                else:
                    raise Exception(f"AviationStack API error: {response.status_code} - {error_message}")
            
            data = response.json()
            
            if not data.get("data") or len(data["data"]) == 0:
                raise Exception(f"No flight data found for {flight_number}")
            
            # Get the first flight from the results
            flight_data = data["data"][0]
            
            # Extract relevant information (AviationStack structure)
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

# Create a singleton instance
flight_lookup_service = FlightLookupService()