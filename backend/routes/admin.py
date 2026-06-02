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

class DocumentReviewReq(BaseModel):
    status: str
    reason: Optional[str] = None

@router.post("/documents/{doc_id}/review")
def review_document(doc_id: int, req: DocumentReviewReq, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE DOCUMENTS SET status = :1, reviewed_by = :2, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = :3, updated_by = :2 WHERE doc_id = :4",
        [req.status, current_user["user_id"], req.reason, doc_id]
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if req.status == 'Rejected':
        cursor.execute("SELECT user_id, doc_type FROM DOCUMENTS WHERE doc_id = :1", [doc_id])
        doc_user, doc_type = cursor.fetchone()
        cursor.execute(
            "INSERT INTO NOTIFICATIONS (user_id, type, message, action_link, metadata) VALUES (:1, 'Document Rejected', :2, '/documents', :3)",
            [doc_user, f"Your {doc_type} was rejected: {req.reason}", f'{{"doc_id": {doc_id}}}']
        )
    conn.commit()
    return {"message": f"Document {req.status.lower()} successfully"}

@router.get("/users")
def get_all_users(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin", "it_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT u.user_id, u.name, u.email, u.role, d.name "
        "FROM USERS u LEFT JOIN DEPARTMENTS d ON u.department_id = d.department_id "
        "ORDER BY u.user_id DESC"
    )
    users = []
    for row in cursor.fetchall():
        users.append({
            "user_id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3],
            "department": row[4] or "Unassigned"
        })
    return users

@router.delete("/users/{user_id}")
def delete_user(user_id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    # Let constraints fail if user has dependencies, or we can just try to delete them
    try:
        # Delete related dependencies safely first
        cursor.execute("DELETE FROM BUDDY_CHECKINS WHERE buddy_id IN (SELECT buddy_id FROM BUDDIES WHERE new_hire_id = :1 OR buddy_user_id = :1)", [user_id])
        cursor.execute("DELETE FROM BUDDIES WHERE new_hire_id = :1 OR buddy_user_id = :1", [user_id])
        cursor.execute("DELETE FROM TASK_ASSIGNMENTS WHERE user_id = :1", [user_id])
        cursor.execute("DELETE FROM TRAINING_ASSIGNMENTS WHERE user_id = :1", [user_id])
        cursor.execute("DELETE FROM DOCUMENTS WHERE user_id = :1", [user_id])
        cursor.execute("DELETE FROM ASSET_ASSIGNMENTS WHERE user_id = :1", [user_id])
        cursor.execute("DELETE FROM NOTIFICATIONS WHERE user_id = :1", [user_id])
        
        cursor.execute("DELETE FROM USERS WHERE user_id = :1", [user_id])
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class AssetCreateReq(BaseModel):
    name: str
    serial_number: str
    category: str
    condition: str = 'New'

@router.post("/assets")
def create_asset(req: AssetCreateReq, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["it_admin", "hr_admin"]))):
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO ASSETS (name, serial_number, category, condition) VALUES (:1, :2, :3, :4)",
            [req.name, req.serial_number, req.category, req.condition]
        )
        conn.commit()
        return {"message": "Asset created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["it_admin", "hr_admin"]))):
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM ASSET_ASSIGNMENTS WHERE asset_id = :1", [asset_id])
        cursor.execute("DELETE FROM ASSETS WHERE asset_id = :1", [asset_id])
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        conn.commit()
        return {"message": "Asset deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/assets/{asset_id}/unassign")
def unassign_asset(asset_id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["it_admin", "hr_admin"]))):
    cursor = conn.cursor()
    try:
        # We find the active assignment and set returned_at or delete it.
        # Simplest is to delete it to 'unassign'.
        cursor.execute("DELETE FROM ASSET_ASSIGNMENTS WHERE asset_id = :1", [asset_id])
        cursor.execute("UPDATE ASSETS SET status = 'Available' WHERE asset_id = :1", [asset_id])
        conn.commit()
        return {"message": "Asset unassigned successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM USERS WHERE department_id = :1", [dept_id])
        if cursor.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Cannot delete department with assigned users")
        
        cursor.execute("DELETE FROM DEPARTMENTS WHERE department_id = :1", [dept_id])
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Department not found")
        conn.commit()
        return {"message": "Department deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
