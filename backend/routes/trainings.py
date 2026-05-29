from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import db
from services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/trainings", tags=["trainings"])

@router.get("/my")
def get_my_trainings(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT ta.ta_id, ta.training_id, ta.user_id, ta.status, ta.assigned_at, ta.completed_at, "
        "t.title, t.description, t.duration_hours, t.resource_url, t.is_mandatory "
        "FROM TRAINING_ASSIGNMENTS ta JOIN TRAININGS t ON ta.training_id = t.training_id "
        "WHERE ta.user_id = :1", [current_user["user_id"]]
    )
    
    trainings = []
    for row in cursor.fetchall():
        trainings.append({
            "ta_id": row[0],
            "training_id": row[1],
            "user_id": row[2],
            "status": row[3],
            "assigned_at": row[4],
            "completed_at": row[5],
            "training": {
                "training_id": row[1],
                "title": row[6],
                "description": row[7],
                "duration_hours": row[8],
                "resource_url": row[9],
                "is_mandatory": row[10]
            }
        })
    return trainings

@router.put("/{ta_id}/complete")
def complete_training(ta_id: int, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE TRAINING_ASSIGNMENTS SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE ta_id = :1 AND user_id = :2",
            [ta_id, current_user['user_id']]
        )
        conn.commit()
        return {"message": "Training completed"}
    finally:
        db.release_connection(conn)

class TrainingAssignReq(BaseModel):
    user_id: int
    training_id: int

@router.post("/assign")
def assign_training(req: TrainingAssignReq, current_user=Depends(get_current_user)):
    if current_user['role'] != 'hr_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO TRAINING_ASSIGNMENTS (training_id, user_id, status) VALUES (:1, :2, 'Pending')",
            [req.training_id, req.user_id]
        )
        conn.commit()
        return {"message": "Training assigned"}
    finally:
        db.release_connection(conn)

@router.get("/report")
def training_report(current_user=Depends(get_current_user)):
    if current_user['role'] != 'hr_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT u.name, t.title, ta.status, ta.completed_at "
            "FROM TRAINING_ASSIGNMENTS ta JOIN USERS u ON ta.user_id = u.user_id "
            "JOIN TRAININGS t ON ta.training_id = t.training_id"
        )
        return [{"employee": r[0], "training": r[1], "status": r[2], "completed_at": r[3]} for r in cursor.fetchall()]
    finally:
        db.release_connection(conn)
