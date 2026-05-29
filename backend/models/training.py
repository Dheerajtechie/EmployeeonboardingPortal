from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TrainingBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_hours: float
    resource_url: Optional[str] = None
    is_mandatory: int = 1

class TrainingResponse(TrainingBase):
    training_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TrainingAssign(BaseModel):
    training_id: int
    user_id: int

class TrainingAssignmentResponse(BaseModel):
    ta_id: int
    training_id: int
    user_id: int
    status: str
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    training: Optional[TrainingResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
