import google.generativeai as genai
from typing import Dict, Any, List
import json
from datetime import datetime, timedelta
import pytz

from app.core.config import settings
from app.models.trip import Trip
from app.models.user import User


class GeminiClient:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_chrono_plan(self, trip: Trip, user: User) -> Dict[str, Any]:
        """Generate a chronobiology plan using Gemini AI"""
        
        # Prepare the prompt
        prompt = self._build_prompt(trip, user)
        
        try:
            # Call Gemini API
            response = self.model.generate_content(prompt)
            
            # Parse the response
            plan_data = self._parse_gemini_response(response.text)
            
            return {
                "days": plan_data,
                "raw_response": response.text
            }
            
        except Exception as e:
            # Fallback to mock data if Gemini fails
            print(f"Gemini API error: {str(e)}")
            return self._generate_mock_plan(trip, user)
    
    def _build_prompt(self, trip: Trip, user: User) -> str:
        """Build the prompt for Gemini"""
        
        safety_disclaimer = (
            "IMPORTANT MEDICAL DISCLAIMER: "
            "This app provides general guidance, not medical advice. "
            "Consult a healthcare professional before using melatonin or making "
            "significant changes to sleep or medication routines."
        )
        
        prompt = f"""
You are a chronobiology expert creating a personalized jet-lag adjustment plan.

TRIP DETAILS:
- Origin: {trip.origin_location['name']} ({trip.origin_timezone})
- Destination: {trip.destination_location['name']} ({trip.destination_timezone})
- Departure: {trip.departure_utc}
- Arrival: {trip.arrival_utc}
- Flight Duration: {trip.flight_duration_minutes} minutes

USER PROFILE:
- Chronotype: {user.chronotype}
- Sensitivity: {user.sensitivity}
- Timezone: {user.timezone}

{safety_disclaimer}

Create a multi-day chronobiology plan that gradually shifts the user's circadian rhythm from their origin timezone to their destination timezone. The plan should include:

1. Light exposure windows (morning light to advance phase, evening light avoidance to delay phase)
2. Meal timing aligned to the new schedule
3. Hydration guidance
4. Sleep window adjustments
5. Melatonin timing recommendations (with medical disclaimer)
6. Caffeine guidance
7. In-flight recommendations

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "date_local": "YYYY-MM-DD",
    "actions": [
      {{
        "type": "light|meal|hydration|sleep|melatonin|caffeine|activity",
        "start_local": "HH:MM",
        "end_local": "HH:MM",
        "instruction": "Detailed instruction text",
        "confidence_score": 0.8,
        "source": "gemini",
        "metadata": {{}}
      }}
    ]
  }}
]

Generate 5-7 days of plan data starting from 3 days before departure through 2-3 days after arrival.
"""
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse Gemini response into structured plan data"""
        try:
            # Extract JSON from response
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("No JSON array found in response")
            
            json_str = response_text[start_idx:end_idx]
            plan_data = json.loads(json_str)
            
            return plan_data
            
        except Exception as e:
            print(f"Error parsing Gemini response: {str(e)}")
            raise
    
    def _generate_mock_plan(self, trip: Trip, user: User) -> Dict[str, Any]:
        """Generate a mock plan as fallback"""
        
        # Calculate timezone offset
        origin_tz = pytz.timezone(trip.origin_timezone)
        dest_tz = pytz.timezone(trip.destination_timezone)
        
        # Get current time in both timezones
        now_utc = datetime.utcnow().replace(tzinfo=pytz.UTC)
        origin_time = now_utc.astimezone(origin_tz)
        dest_time = now_utc.astimezone(dest_tz)
        
        # Calculate offset in hours
        offset_hours = (dest_time.hour - origin_time.hour) % 24
        
        # Generate mock plan
        days = []
        for i in range(5):  # 5 days of plan
            date = (now_utc + timedelta(days=i)).strftime("%Y-%m-%d")
            
            actions = [
                {
                    "type": "light",
                    "start_local": "07:00",
                    "end_local": "08:00",
                    "instruction": f"Seek bright outdoor light for 30-60 minutes to help adjust your circadian rhythm",
                    "confidence_score": 0.8,
                    "source": "local-rules",
                    "metadata": {}
                },
                {
                    "type": "meal",
                    "start_local": "08:00",
                    "end_local": "09:00",
                    "instruction": "Eat a protein-rich breakfast to help anchor your new meal schedule",
                    "confidence_score": 0.7,
                    "source": "local-rules",
                    "metadata": {}
                },
                {
                    "type": "sleep",
                    "start_local": "23:00",
                    "end_local": "07:00",
                    "instruction": f"Target sleep window: {8} hours. Avoid screens 1 hour before bedtime.",
                    "confidence_score": 0.9,
                    "source": "local-rules",
                    "metadata": {}
                }
            ]
            
            days.append({
                "date_local": date,
                "actions": actions
            })
        
        return {
            "days": days,
            "raw_response": "Mock plan generated due to API error"
        }
