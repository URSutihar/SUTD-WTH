import os
import json
import httpx
from typing import Dict, Any, Optional

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Missing GEMINI_API_KEY")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1"
        self.model = "gemini-1.5-flash"

    async def generate_jetlag_plan(self, user_data: Dict[str, Any], trip_data: Dict[str, Any], weather_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate a personalized jet lag plan using Gemini"""
        
        prompt = self._build_prompt(user_data, trip_data, weather_data)
        
        print(f"Making request to: {self.base_url}/models/{self.model}:generateContent")
        print(f"API Key present: {bool(self.api_key)}")
        print(f"API Key length: {len(self.api_key) if self.api_key else 0}")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/models/{self.model}:generateContent",
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": self.api_key
                    },
                    json={
                        "contents": [{
                            "parts": [{
                                "text": prompt
                            }]
                        }],
                        "generationConfig": {
                            "temperature": 0.7,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 8192,
                        }
                    }
                )
                
                print(f"Response status: {response.status_code}")
                print(f"Response headers: {dict(response.headers)}")
                
                if response.status_code != 200:
                    print(f"Error response text: {response.text}")
                    raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
                
                result = response.json()
                print(f"Response JSON keys: {list(result.keys())}")
                
                if "candidates" not in result:
                    print(f"Full response: {result}")
                    raise Exception(f"No candidates in response: {result}")
                
                content = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Extract JSON from markdown code blocks if present
                if content.strip().startswith("```json"):
                    # Remove markdown code block markers
                    content = content.strip()
                    if content.startswith("```json"):
                        content = content[7:]  # Remove "```json"
                    if content.endswith("```"):
                        content = content[:-3]  # Remove "```"
                    content = content.strip()
                
                # Parse JSON response
                try:
                    return json.loads(content)
                except json.JSONDecodeError as e:
                    print(f"Failed to parse JSON. Content: {content[:500]}...")
                    raise Exception(f"Failed to parse Gemini response as JSON: {e}")
                    
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            print(f"Response status: {response.status_code if 'response' in locals() else 'No response'}")
            print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
            raise

    def _build_prompt(self, user_data: Dict[str, Any], trip_data: Dict[str, Any], weather_data: Optional[Dict[str, Any]] = None) -> str:
        """Build the prompt for Gemini"""
        
        prompt = f"""
You are a chronobiology assistant specializing in jet lag prevention and recovery. Generate a precise, conservative, and safe circadian plan for the following trip.

IMPORTANT: Always include a prominent medical disclaimer about melatonin/caffeine and recommend consulting a physician before taking supplements.

Trip Details:
- Origin: {trip_data.get('origin', 'Unknown')} ({trip_data.get('origin_timezone', 'UTC')})
- Destination: {trip_data.get('destination', 'Unknown')} ({trip_data.get('destination_timezone', 'UTC')})
- Departure: {trip_data.get('departure_utc', 'Unknown')}
- Arrival: {trip_data.get('arrival_utc', 'Unknown')}
- Flight Duration: {trip_data.get('flight_duration_minutes', 0)} minutes
- Layovers: {len(trip_data.get('layovers', []))} layover(s)

User Profile:
- Chronotype: {user_data.get('chronotype', 'intermediate')}
- Sleep Baseline: {user_data.get('sleep_baseline', {})}
- Email: {user_data.get('email', 'Unknown')}

Preferences:
- Max Caffeine: {user_data.get('preferences', {}).get('max_caffeine_mg', 200)}mg
- Melatonin Preference: {user_data.get('preferences', {}).get('melatonin_preference_mg', 1)}mg
- Avoid Medications: {user_data.get('preferences', {}).get('avoid_medications', False)}

Weather Data:
{json.dumps(weather_data, indent=2) if weather_data else 'Not available'}

Generate a structured circadian plan with the following phases:
1. Pre-trip (2-3 days before departure)
2. Travel day
3. Post-arrival (2-3 days after arrival)

For each phase, include specific actions with:
- Exact local timestamps (destination timezone)
- Action type (light, avoid_light, sleep, nap, meal, hydrate, melatonin, caffeine, activity)
- Duration in minutes
- Priority level (low, medium, high)
- Clear, actionable instructions
- Safety notes for medications
- Dose information for melatonin/caffeine

Return ONLY a valid JSON object matching this exact schema:

{{
  "schedule_version": "1.0",
  "trip_id": "trip-{trip_data.get('id', 'unknown')}",
  "timezone": "{trip_data.get('destination_timezone', 'UTC')}",
  "phases": [
    {{
      "phase_name": "pre-trip",
      "start_local": "2025-09-29T07:00:00-07:00",
      "end_local": "2025-10-01T02:00:00-07:00",
      "actions": [
        {{
          "action_id": "a1",
          "type": "light",
          "when_local": "2025-09-29T07:15:00-07:00",
          "when_utc": "2025-09-29T14:15:00Z",
          "duration_minutes": 30,
          "priority": "high",
          "details": "Get outdoor morning light immediately after waking for 30 minutes to advance your clock.",
          "dose_mg": null,
          "safety_notes": null
        }}
      ]
    }}
  ],
  "disclaimer": "This app provides guidance only. Consult a physician before taking melatonin or making major changes to sleep medication.",
  "metadata": {{
    "generated_at_utc": "2025-09-20T10:00:00Z",
    "model": "Gemini"
  }}
}}

Focus on:
- Light exposure timing relative to sunrise/sunset
- Meal timing for circadian entrainment
- Sleep schedule adjustments
- Melatonin timing (if user allows medications)
- Caffeine timing and limits
- Hydration reminders
- Physical activity recommendations

Ensure all timestamps are in the destination timezone and properly formatted as ISO 8601 strings.
"""
        
        return prompt

    async def generate_shift_work_plan(self, user_data: Dict[str, Any], shift_work_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a personalized shift work adaptation plan using Gemini"""
        
        prompt = self._build_shift_work_prompt(user_data, shift_work_data)
        
        print(f"Making request to: {self.base_url}/models/{self.model}:generateContent")
        print(f"API Key present: {bool(self.api_key)}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/models/{self.model}:generateContent",
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": self.api_key
                    },
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "temperature": 0.7,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 4096,
                        }
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    print(f"Gemini API error: {response.status_code} - {response.text}")
                    raise Exception(f"Gemini API error: {response.status_code}")
                
                result = response.json()
                
                if 'candidates' not in result or not result['candidates']:
                    print(f"No candidates in response: {result}")
                    raise Exception("No response from Gemini")
                
                content = result['candidates'][0]['content']['parts'][0]['text']
                print(f"Raw Gemini response: {content[:200]}...")
                
                # Parse JSON response
                try:
                    # Extract JSON from response (handle potential markdown formatting)
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    if json_start != -1 and json_end != -1:
                        json_str = content[json_start:json_end]
                        return json.loads(json_str)
                    else:
                        raise Exception("No valid JSON found in response")
                except json.JSONDecodeError as e:
                    print(f"JSON parsing error: {e}")
                    print(f"Content: {content}")
                    raise Exception(f"Failed to parse JSON response: {e}")
                
        except httpx.TimeoutException:
            print("Gemini API timeout")
            raise Exception("Gemini API timeout")
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            raise

    async def generate_sleep_schedule_plan(self, user_data: Dict[str, Any], sleep_schedule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a personalized sleep schedule adjustment plan using Gemini"""
        
        prompt = self._build_sleep_schedule_prompt(user_data, sleep_schedule_data)
        
        print(f"Making request to: {self.base_url}/models/{self.model}:generateContent")
        print(f"API Key present: {bool(self.api_key)}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/models/{self.model}:generateContent",
                    headers={
                        "Content-Type": "application/json",
                        "x-goog-api-key": self.api_key
                    },
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "temperature": 0.7,
                            "topK": 40,
                            "topP": 0.95,
                            "maxOutputTokens": 4096,
                        }
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    print(f"Gemini API error: {response.status_code} - {response.text}")
                    raise Exception(f"Gemini API error: {response.status_code}")
                
                result = response.json()
                
                if 'candidates' not in result or not result['candidates']:
                    print(f"No candidates in response: {result}")
                    raise Exception("No response from Gemini")
                
                content = result['candidates'][0]['content']['parts'][0]['text']
                print(f"Raw Gemini response: {content[:200]}...")
                
                # Parse JSON response
                try:
                    # Extract JSON from response (handle potential markdown formatting)
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    if json_start != -1 and json_end != -1:
                        json_str = content[json_start:json_end]
                        return json.loads(json_str)
                    else:
                        raise Exception("No valid JSON found in response")
                except json.JSONDecodeError as e:
                    print(f"JSON parsing error: {e}")
                    print(f"Content: {content}")
                    raise Exception(f"Failed to parse JSON response: {e}")
                
        except httpx.TimeoutException:
            print("Gemini API timeout")
            raise Exception("Gemini API timeout")
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            raise

    def _build_shift_work_prompt(self, user_data: Dict[str, Any], shift_work_data: Dict[str, Any]) -> str:
        """Build prompt for shift work adaptation plan"""
        
        current_schedule = shift_work_data.get("current_schedule", {})
        desired_schedule = shift_work_data.get("desired_schedule", {})
        shift_details = shift_work_data.get("shift_details", {})
        preferences = shift_work_data.get("preferences", {})
        
        return f"""You are a circadian rhythm expert helping someone adapt to shift work. Generate a personalized shift work adaptation plan.

User Profile:
- Chronotype: {user_data.get('chronotype', 'intermediate')}
- Current Sleep Schedule: {current_schedule.get('bedtime', 'unknown')} - {current_schedule.get('waketime', 'unknown')}
- Sleep Duration: {current_schedule.get('sleepDuration', 'unknown')}

Shift Work Details:
- Shift Type: {shift_details.get('shiftType', 'unknown')}
- Work Start: {shift_details.get('workStartTime', 'unknown')}
- Work End: {shift_details.get('workEndTime', 'unknown')}
- Work Days: {', '.join(shift_details.get('workDays', []))}

Desired Schedule:
- Target Bedtime: {desired_schedule.get('bedtime', 'unknown')}
- Target Wake Time: {desired_schedule.get('waketime', 'unknown')}
- Target Sleep Duration: {desired_schedule.get('sleepDuration', 'unknown')}

Preferences:
{json.dumps(preferences, indent=2)}

Generate a structured circadian adaptation plan with the following phases:
1. Pre-shift preparation (2-3 days before first shift)
2. Shift adaptation (during work days)
3. Recovery (off days)

For each phase, include specific actions with:
- Exact timestamps (local time)
- Action type (light, avoid_light, sleep, nap, meal, hydrate, melatonin, caffeine, activity)
- Duration in minutes
- Priority level (low, medium, high)
- Clear, actionable instructions
- Safety notes for medications
- Dose information for melatonin/caffeine

Return ONLY a valid JSON object matching this exact schema:

{{
  "schedule_version": "1.0",
  "plan_type": "shift_work_adaptation",
  "plan_id": "shift-{shift_work_data.get('id', 'unknown')}",
  "timezone": "UTC",
  "phases": [
    {{
      "phase_name": "pre-shift_preparation",
      "start_local": "2025-01-01T00:00:00Z",
      "end_local": "2025-01-03T23:59:59Z",
      "actions": [
        {{
          "action_id": "a1",
          "type": "light",
          "when_local": "2025-01-01T07:00:00Z",
          "when_utc": "2025-01-01T07:00:00Z",
          "duration_minutes": 30,
          "priority": "high",
          "details": "Get bright light exposure to advance circadian clock",
          "dose_mg": null,
          "safety_notes": null
        }}
      ]
    }}
  ],
  "disclaimer": "This app provides guidance only. Consult a physician before taking melatonin or making major changes to sleep medication.",
  "metadata": {{
    "generated_at_utc": "2025-01-01T00:00:00Z",
    "model": "Gemini"
  }}
}}

Focus on:
- Gradual sleep schedule shifts
- Light exposure timing for circadian entrainment
- Meal timing for shift work
- Sleep hygiene during shift work
- Recovery strategies for off days
- Melatonin timing (if user allows medications)
- Caffeine timing and limits
- Hydration reminders
- Physical activity recommendations

Ensure all timestamps are properly formatted as ISO 8601 strings.
"""

    def _build_sleep_schedule_prompt(self, user_data: Dict[str, Any], sleep_schedule_data: Dict[str, Any]) -> str:
        """Build prompt for sleep schedule adjustment plan"""
        
        current_schedule = sleep_schedule_data.get("current_schedule", {})
        desired_schedule = sleep_schedule_data.get("desired_schedule", {})
        sleep_issues = sleep_schedule_data.get("sleep_issues", {})
        preferences = sleep_schedule_data.get("preferences", {})
        
        return f"""You are a sleep specialist helping someone improve their sleep schedule. Generate a personalized sleep schedule adjustment plan.

User Profile:
- Chronotype: {preferences.get('chronotype', 'intermediate')}
- Light Sensitivity: {preferences.get('lightSensitivity', 'medium')}
- Caffeine Intake: {preferences.get('caffeineIntake', 'moderate')}

Current Sleep Schedule:
- Bedtime: {current_schedule.get('bedtime', 'unknown')}
- Wake Time: {current_schedule.get('waketime', 'unknown')}
- Sleep Duration: {current_schedule.get('sleepDuration', 'unknown')}

Desired Sleep Schedule:
- Target Bedtime: {desired_schedule.get('bedtime', 'unknown')}
- Target Wake Time: {desired_schedule.get('waketime', 'unknown')}
- Target Sleep Duration: {desired_schedule.get('sleepDuration', 'unknown')}

Sleep Issues:
- Difficulty Falling Asleep: {sleep_issues.get('difficultyFallingAsleep', False)}
- Difficulty Staying Asleep: {sleep_issues.get('difficultyStayingAsleep', False)}
- Early Morning Awakening: {sleep_issues.get('earlyMorningAwakening', False)}
- Irregular Schedule: {sleep_issues.get('irregularSchedule', False)}
- Jet Lag: {sleep_issues.get('jetLag', False)}
- Shift Work: {sleep_issues.get('shiftWork', False)}

Generate a structured sleep schedule adjustment plan with the following phases:
1. Assessment and preparation (1-2 days)
2. Gradual adjustment (7-14 days)
3. Maintenance and optimization (ongoing)

For each phase, include specific actions with:
- Exact timestamps (local time)
- Action type (light, avoid_light, sleep, nap, meal, hydrate, melatonin, caffeine, activity)
- Duration in minutes
- Priority level (low, medium, high)
- Clear, actionable instructions
- Safety notes for medications
- Dose information for melatonin/caffeine

Return ONLY a valid JSON object matching this exact schema:

{{
  "schedule_version": "1.0",
  "plan_type": "sleep_schedule_adjustment",
  "plan_id": "sleep-{sleep_schedule_data.get('id', 'unknown')}",
  "timezone": "UTC",
  "phases": [
    {{
      "phase_name": "gradual_adjustment",
      "start_local": "2025-01-01T00:00:00Z",
      "end_local": "2025-01-14T23:59:59Z",
      "actions": [
        {{
          "action_id": "a1",
          "type": "light",
          "when_local": "2025-01-01T07:00:00Z",
          "when_utc": "2025-01-01T07:00:00Z",
          "duration_minutes": 30,
          "priority": "high",
          "details": "Get morning light exposure to advance circadian clock",
          "dose_mg": null,
          "safety_notes": null
        }}
      ]
    }}
  ],
  "disclaimer": "This app provides guidance only. Consult a physician before taking melatonin or making major changes to sleep medication.",
  "metadata": {{
    "generated_at_utc": "2025-01-01T00:00:00Z",
    "model": "Gemini"
  }}
}}

Focus on:
- Gradual sleep schedule shifts (15-30 minutes per day)
- Light exposure timing for circadian entrainment
- Sleep hygiene improvements
- Bedtime routine optimization
- Wake time consistency
- Melatonin timing (if user allows medications)
- Caffeine timing and limits
- Hydration reminders
- Physical activity recommendations
- Stress management techniques

Ensure all timestamps are properly formatted as ISO 8601 strings.
"""
