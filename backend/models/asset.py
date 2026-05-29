from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AssetBase(BaseModel):
    name: str
    serial_number: str
    category: str
    condition: str = "Good"
    status: str = "Available"

class AssetResponse(AssetBase):
    asset_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AssetAssign(BaseModel):
    asset_id: int
    user_id: int

class AssetAssignmentResponse(BaseModel):
    aa_id: int
    asset_id: int
    user_id: int
    assigned_by: int
    assigned_date: datetime
    confirmed_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    asset: Optional[AssetResponse] = None
    
    model_config = ConfigDict(from_attributes=True)
