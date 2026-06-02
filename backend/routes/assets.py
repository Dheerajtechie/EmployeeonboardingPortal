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
        "a.name, a.serial_number, a.category, a.condition, a.status AS a_status, "
        "aa.acknowledgement_date, aa.return_date, aa.damaged_notes, aa.status AS aa_status "
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
            "acknowledgement_date": row[12],
            "return_date": row[13],
            "damaged_notes": row[14],
            "status": row[15],
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
        "UPDATE ASSET_ASSIGNMENTS SET confirmed_at = CURRENT_TIMESTAMP, acknowledgement_date = CURRENT_TIMESTAMP, status = 'Acknowledged' WHERE aa_id = :1 AND user_id = :2",
        [id, current_user["user_id"]]
    )
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Asset assignment not found")
        
    cursor.execute("SELECT asset_id FROM ASSET_ASSIGNMENTS WHERE aa_id = :1", [id])
    asset_id = cursor.fetchone()[0]

    cursor.execute(
        "INSERT INTO ASSET_LIFECYCLE_HISTORY (asset_id, user_id, status, notes, changed_by) VALUES (:1, :2, 'Acknowledged', 'Employee confirmed receipt', :3)",
        [asset_id, current_user["user_id"], current_user["user_id"]]
    )

    # Auto-complete IT Setup task (task_id 2: 'Collect Laptop from IT')
    cursor.execute("UPDATE TASK_ASSIGNMENTS SET status = 'Completed' WHERE user_id = :1 AND task_id = 2", [current_user["user_id"]])

    conn.commit()
    return {"message": "Asset receipt confirmed"}

from models.asset import AssetStatusUpdate

@router.put("/{id}/status")
def update_asset_status(id: int, data: AssetStatusUpdate, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["it_admin", "hr_admin", "new_hire"]))):
    cursor = conn.cursor()
    cursor.execute("SELECT asset_id, user_id FROM ASSET_ASSIGNMENTS WHERE aa_id = :1", [id])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Asset assignment not found")
    asset_id, user_id = row

    # Security check: new hires can only mark their own assets as returned/damaged
    if current_user["role"] == "new_hire":
        if user_id != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        if data.status not in ["Returned", "Damaged", "Lost"]:
            raise HTTPException(status_code=400, detail="Invalid status update for employee")

    upd_sql = "UPDATE ASSET_ASSIGNMENTS SET status = :1"
    params = [data.status]
    if data.status == "Returned":
        upd_sql += ", returned_at = CURRENT_TIMESTAMP, return_date = CURRENT_TIMESTAMP"
    elif data.status == "Damaged":
        upd_sql += ", damaged_notes = :2"
        params.append(data.notes)
    
    upd_sql += f" WHERE aa_id = :{len(params) + 1}"
    params.append(id)

    cursor.execute(upd_sql, params)
    
    cursor.execute(
        "INSERT INTO ASSET_LIFECYCLE_HISTORY (asset_id, user_id, status, notes, changed_by) VALUES (:1, :2, :3, :4, :5)",
        [asset_id, user_id, data.status, data.notes, current_user["user_id"]]
    )
    
    # Also update base asset condition if damaged
    if data.status == "Damaged":
        cursor.execute("UPDATE ASSETS SET condition = 'Damaged', status = 'Needs Repair' WHERE asset_id = :1", [asset_id])
    elif data.status == "Returned":
        cursor.execute("UPDATE ASSETS SET status = 'Available' WHERE asset_id = :1", [asset_id])

    conn.commit()
    return {"message": f"Asset status updated to {data.status}"}

