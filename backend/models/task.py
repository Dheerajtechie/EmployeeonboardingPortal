from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    default_due_days: int = 7
    is_mandatory: int = 1
    department_id: Optional[int] = None

class TaskResponse(TaskBase):
    task_id: int
    model_config = ConfigDict(from_attributes=True)

class TaskAssignmentResponse(BaseModel):
    assignment_id: int
    task_id: int
    user_id: int
    status: str
    due_date: datetime
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    task: Optional[TaskResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
