from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import db
from services.auth_service import get_current_user, require_role
from models.task import TaskAssignmentResponse
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/my")
def get_my_tasks(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT ta.assignment_id, ta.task_id, ta.user_id, ta.status, ta.due_date, ta.completed_at, ta.notes, "
        "t.title, t.description, t.category, t.default_due_days, t.is_mandatory, t.department_id "
        "FROM TASK_ASSIGNMENTS ta JOIN ONBOARDING_TASKS t ON ta.task_id = t.task_id "
        "WHERE ta.user_id = :1", [current_user["user_id"]]
    )
    
    tasks = []
    for row in cursor.fetchall():
        tasks.append({
            "assignment_id": row[0],
            "task_id": row[1],
            "user_id": row[2],
            "status": row[3],
            "due_date": row[4],
            "completed_at": row[5],
            "notes": row[6],
            "title": row[7],
            "task": {
                "task_id": row[1],
                "title": row[7],
                "description": row[8],
                "category": row[9],
                "default_due_days": row[10],
                "is_mandatory": row[11],
                "department_id": row[12]
            }
        })
    return tasks

@router.put("/{id}/complete")
def complete_task(id: int, current_user: dict = Depends(get_current_user)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE TASK_ASSIGNMENTS SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE task_id = :1 AND user_id = :2",
            [id, current_user["user_id"]]
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task assignment not found")
            
        conn.commit()
        return {"message": "Task marked as completed"}
    finally:
        db.release_connection(conn)

class TaskAssignReq(BaseModel):
    task_id: int

@router.post("/admin/assign-tasks/{user_id}")
def assign_task_to_user(user_id: int, req: TaskAssignReq, current_user=Depends(get_current_user)):
    if current_user['role'] != 'hr_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO TASK_ASSIGNMENTS (assignment_id, task_id, user_id, status, due_date) VALUES (assignment_seq.nextval, :1, :2, 'Pending', CURRENT_DATE + 7)",
            [req.task_id, user_id]
        )
        conn.commit()
        return {"message": "Task assigned"}
    finally:
        db.release_connection(conn)
