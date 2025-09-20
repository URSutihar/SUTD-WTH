from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SleepSchedule(BaseModel):
    bedtime: str
    waketime: str
    sleepDuration: str

class ShiftDetails(BaseModel):
    shiftType: str = Field(..., description="Type of shift: day, night, or rotating")
    workStartTime: str
    workEndTime: str
    workDays: List[str] = Field(default_factory=list, description="List of work days")

class ShiftWorkPlanCreate(BaseModel):
    user_id: str
    current_schedule: Dict[str, Any]  # SleepSchedule as dict
    desired_schedule: Dict[str, Any]  # SleepSchedule as dict
    shift_details: Dict[str, Any]    # ShiftDetails as dict
    preferences: Dict[str, Any] = Field(default_factory=dict)

class ShiftWorkPlanResponse(BaseModel):
    id: str
    user_id: str
    current_schedule: Dict[str, Any]
    desired_schedule: Dict[str, Any]
    shift_details: Dict[str, Any]
    preferences: Dict[str, Any]
    created_at: datetime
    schedule: Optional[Dict[str, Any]] = None

class ShiftWorkPlanListResponse(BaseModel):
    plans: List[ShiftWorkPlanResponse]
    total: int

class SleepIssues(BaseModel):
    difficultyFallingAsleep: bool = False
    difficultyStayingAsleep: bool = False
    earlyMorningAwakening: bool = False
    irregularSchedule: bool = False
    jetLag: bool = False
    shiftWork: bool = False

class SleepPreferences(BaseModel):
    chronotype: str = Field(default="intermediate", description="early, intermediate, or late")
    lightSensitivity: str = Field(default="medium", description="low, medium, or high")
    caffeineIntake: str = Field(default="moderate", description="none, light, moderate, or heavy")

class SleepSchedulePlanCreate(BaseModel):
    user_id: str
    current_schedule: Dict[str, Any]  # SleepSchedule as dict
    desired_schedule: Dict[str, Any]  # SleepSchedule as dict
    sleep_issues: Dict[str, Any]      # SleepIssues as dict
    preferences: Dict[str, Any]       # SleepPreferences as dict

class SleepSchedulePlanResponse(BaseModel):
    id: str
    user_id: str
    current_schedule: Dict[str, Any]
    desired_schedule: Dict[str, Any]
    sleep_issues: Dict[str, Any]
    preferences: Dict[str, Any]
    created_at: datetime
    schedule: Optional[Dict[str, Any]] = None

class SleepSchedulePlanListResponse(BaseModel):
    plans: List[SleepSchedulePlanResponse]
    total: int
