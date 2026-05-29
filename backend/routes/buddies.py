from fastapi import APIRouter, Depends, HTTPException
import db
from services.auth_service import get_current_user, require_role
from models.buddy import CheckinCreate

router = APIRouter(prefix="/buddy", tags=["buddy"])

@router.get("/my")
def get_my_buddy(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT b.buddy_id, b.new_hire_id, b.buddy_user_id, b.assigned_by, b.assigned_date, b.is_active, "
        "u.name, u.email "
        "FROM BUDDIES b JOIN USERS u ON b.buddy_user_id = u.user_id "
        "WHERE b.new_hire_id = :1 AND b.is_active = 1", [current_user["user_id"]]
    )
    
    row = cursor.fetchone()
    if not row:
        return None
        
    return {
        "buddy_id": row[0],
        "new_hire_id": row[1],
        "buddy_user_id": row[2],
        "assigned_by": row[3],
        "assigned_date": row[4],
        "is_active": row[5],
        "buddy_name": row[6],
        "buddy_email": row[7]
    }

@router.post("/checkin")
def add_checkin(data: CheckinCreate, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["buddy"]))):
    cursor = conn.cursor()
    # Verify buddy owns this pairing
    cursor.execute("SELECT buddy_id FROM BUDDIES WHERE buddy_id = :1 AND buddy_user_id = :2", [data.buddy_id, current_user["user_id"]])
    if not cursor.fetchone():
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    cursor.execute(
        "INSERT INTO BUDDY_CHECKINS (buddy_id, notes, checkin_date) VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'))",
        [data.buddy_id, data.notes, data.checkin_date.isoformat()]
    )
    
    conn.commit()
    return {"message": "Check-in logged"}

@router.get("/checkins/{user_id}")
def get_checkins(user_id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["buddy", "hr_admin", "new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT c.checkin_id, c.buddy_id, c.notes, c.checkin_date, c.created_at "
        "FROM BUDDY_CHECKINS c JOIN BUDDIES b ON c.buddy_id = b.buddy_id "
        "WHERE b.new_hire_id = :1 ORDER BY c.checkin_date DESC", [user_id]
    )
    
    checkins = []
    for row in cursor.fetchall():
        checkins.append({
            "checkin_id": row[0],
            "buddy_id": row[1],
            "notes": row[2].read() if hasattr(row[2], 'read') else row[2],
            "checkin_date": row[3],
            "created_at": row[4]
        })
    return checkins
