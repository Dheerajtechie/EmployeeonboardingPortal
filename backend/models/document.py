from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    doc_type: str

class DocumentResponse(DocumentBase):
    doc_id: int
    user_id: int
    file_path: str
    status: str
    reviewed_by: Optional[int] = None
    rejection_reason: Optional[str] = None
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class DocumentReject(BaseModel):
    reason: str
