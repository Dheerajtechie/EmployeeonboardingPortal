from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from datetime import date

class BuddyAssign(BaseModel):
    new_hire_id: int
    buddy_user_id: int

class BuddyResponse(BaseModel):
    buddy_id: int
    new_hire_id: int
    buddy_user_id: int
    assigned_by: int
    assigned_date: datetime
    is_active: int
    buddy_name: Optional[str] = None
    buddy_email: Optional[str] = None
    new_hire_name: Optional[str] = None
    new_hire_email: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class CheckinCreate(BaseModel):
    buddy_id: int
    notes: str
    checkin_date: date

class CheckinResponse(CheckinCreate):
    checkin_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BuddyMeetingCreate(BaseModel):
    buddy_id: int
    meeting_date: datetime

class BuddyMeetingFeedback(BaseModel):
    meeting_notes: str
    effectiveness_score: int

class BuddyMessage(BaseModel):
    recipient_id: int
    message: str
