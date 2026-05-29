from fastapi import APIRouter, Depends, HTTPException
import db
from services.auth_service import get_current_user, require_role
from models.asset import AssetAssign

router = APIRouter(prefix="/assets", tags=["assets"])

@router.get("/my")
def get_my_assets(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT aa.aa_id, aa.asset_id, aa.user_id, aa.assigned_by, aa.assigned_date, aa.confirmed_at, aa.returned_at, "
        "a.name, a.serial_number, a.category, a.condition, a.status "
        "FROM ASSET_ASSIGNMENTS aa JOIN ASSETS a ON aa.asset_id = a.asset_id "
        "WHERE aa.user_id = :1", [current_user["user_id"]]
    )
    
    assets = []
    for row in cursor.fetchall():
        assets.append({
            "aa_id": row[0],
            "asset_id": row[1],
            "user_id": row[2],
            "assigned_by": row[3],
            "assigned_date": row[4],
            "confirmed_at": row[5],
            "returned_at": row[6],
            "asset": {
                "asset_id": row[1],
                "name": row[7],
                "serial_number": row[8],
                "category": row[9],
                "condition": row[10],
                "status": row[11]
            }
        })
    return assets

@router.put("/{id}/confirm")
def confirm_asset(id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE ASSET_ASSIGNMENTS SET confirmed_at = CURRENT_TIMESTAMP WHERE aa_id = :1 AND user_id = :2",
        [id, current_user["user_id"]]
    )
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Asset assignment not found")
        
    conn.commit()
    return {"message": "Asset receipt confirmed"}
