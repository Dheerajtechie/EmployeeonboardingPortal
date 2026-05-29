from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import db
import csv
import io
from services.auth_service import get_current_user, require_role
from services.onboarding_service import get_completion_percentage
from models.buddy import BuddyAssign
from models.asset import AssetAssign

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/onboarding-status")
def get_onboarding_status(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT u.user_id, u.name, u.email, d.name "
            "FROM USERS u LEFT JOIN DEPARTMENTS d ON u.department_id = d.department_id "
            "WHERE u.role = 'new_hire'"
        )
        hires = cursor.fetchall()

        status_list = []
        for hire in hires:
            user_id, name, email, dept = hire

            cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE user_id = :1", [user_id])
            total_tasks = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE user_id = :1 AND status = 'Completed'", [user_id])
            completed_tasks = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM DOCUMENTS WHERE user_id = :1 AND status = 'Verified'", [user_id])
            verified_docs = cursor.fetchone()[0]

            completion_pct = get_completion_percentage(conn, user_id)

            status_list.append({
                "name": name,
                "email": email,
                "department": dept or "Unassigned",
                "completed_tasks": completed_tasks,
                "total_tasks": total_tasks,
                "verified_docs": verified_docs,
                "completion_percentage": completion_pct,
            })
        return status_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class BulkAssignReq(BaseModel):
    department_id: int
    task_id: int

@router.post("/bulk-assign")
def bulk_assign_tasks(req: BulkAssignReq, current_user=Depends(get_current_user)):
    if current_user['role'] != 'hr_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id FROM USERS WHERE department_id = :1 AND role = 'new_hire'", [req.department_id])
        users = cursor.fetchall()
        count = 0
        for (uid,) in users:
            cursor.execute(
                "INSERT INTO TASK_ASSIGNMENTS (task_id, user_id, status, due_date) VALUES (:1, :2, 'Pending', CURRENT_DATE + 7)",
                [req.task_id, uid]
            )
            count += 1
        conn.commit()
        return {"message": f"Assigned task {req.task_id} to {count} users."}
    finally:
        db.release_connection(conn)

@router.get("/reports/export")
def export_report(current_user=Depends(get_current_user)):
    if current_user['role'] != 'hr_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Email", "Department", "Joining Date"])
    
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT u.name, u.email, d.name, u.joining_date "
            "FROM USERS u LEFT JOIN DEPARTMENTS d ON u.department_id = d.department_id "
            "WHERE u.role='new_hire'"
        )
        for row in cursor.fetchall():
            writer.writerow(row)
    finally:
        db.release_connection(conn)
        
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=onboarding_report.csv"})

@router.get("/departments")
def get_departments(current_user=Depends(get_current_user)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT department_id, name, description FROM DEPARTMENTS")
        return [{"department_id": r[0], "name": r[1], "description": r[2]} for r in cursor.fetchall()]
    finally:
        db.release_connection(conn)

class DeptReq(BaseModel):
    name: str
    description: Optional[str] = None

@router.post("/departments")
def create_department(req: DeptReq, current_user=Depends(get_current_user)):
    if current_user['role'] != 'hr_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO DEPARTMENTS (name, description) VALUES (:1, :2)", [req.name, req.description])
        conn.commit()
        return {"message": "Department created successfully"}
    finally:
        db.release_connection(conn)

@router.get("/dashboard-stats")
def get_dashboard_stats(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM USERS WHERE role = 'new_hire'")
    total_hires = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM DOCUMENTS WHERE status = 'Pending'")
    pending_docs = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE status = 'Pending'")
    pending_tasks = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE status = 'Pending' AND due_date < CURRENT_DATE")
    overdue_tasks = cursor.fetchone()[0]

    cursor.execute("SELECT user_id FROM USERS WHERE role = 'new_hire'")
    hire_ids = [r[0] for r in cursor.fetchall()]
    if hire_ids:
        total_pct = sum(get_completion_percentage(conn, uid) for uid in hire_ids)
        avg_completion = int(total_pct / len(hire_ids))
    else:
        avg_completion = 0

    return {
        "total_new_hires": total_hires,
        "pending_documents": pending_docs,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "completion_rate": avg_completion,
    }

@router.post("/buddy/assign")
def assign_buddy(data: BuddyAssign, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO BUDDIES (new_hire_id, buddy_user_id, assigned_by) VALUES (:1, :2, :3)",
        [data.new_hire_id, data.buddy_user_id, current_user["user_id"]]
    )
    cursor.execute("UPDATE USERS SET role = 'buddy' WHERE user_id = :1 AND role = 'new_hire'", [data.buddy_user_id])
    conn.commit()
    return {"message": "Buddy assigned successfully"}

@router.post("/assets/assign")
def assign_asset(data: AssetAssign, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["it_admin", "hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO ASSET_ASSIGNMENTS (asset_id, user_id, assigned_by) VALUES (:1, :2, :3)",
        [data.asset_id, data.user_id, current_user["user_id"]]
    )
    cursor.execute("UPDATE ASSETS SET status = 'Assigned' WHERE asset_id = :1", [data.asset_id])
    conn.commit()
    return {"message": "Asset assigned successfully"}

@router.get("/assets/inventory")
def get_asset_inventory(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["it_admin", "hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT a.asset_id, a.name, a.serial_number, a.category, a.condition, a.status, "
        "aa.user_id, u.name, aa.assigned_date "
        "FROM ASSETS a "
        "LEFT JOIN ASSET_ASSIGNMENTS aa ON a.asset_id = aa.asset_id "
        "LEFT JOIN USERS u ON aa.user_id = u.user_id "
        "ORDER BY a.asset_id"
    )
    rows = cursor.fetchall()
    inventory = []
    for row in rows:
        inventory.append({
            "asset_id": row[0],
            "name": row[1],
            "serial_number": row[2],
            "category": row[3],
            "condition": row[4],
            "status": row[5],
            "assigned_to": row[7],
        })
    return inventory

@router.get("/pending-documents")
def get_pending_documents(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT d.doc_id, d.user_id, u.name, u.email, d.doc_type, d.file_path, d.status, d.uploaded_at "
        "FROM DOCUMENTS d JOIN USERS u ON d.user_id = u.user_id "
        "WHERE d.status = 'Pending' ORDER BY d.uploaded_at DESC"
    )
    rows = cursor.fetchall()
    documents = []
    for row in rows:
        documents.append({
            "doc_id": row[0],
            "user_id": row[1],
            "user_name": row[2],
            "user_email": row[3],
            "doc_type": row[4],
            "file_path": row[5],
            "status": row[6],
            "uploaded_at": row[7],
        })
    return documents
