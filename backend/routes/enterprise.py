from fastapi import APIRouter, Depends, HTTPException
import db
from services.auth_service import get_current_user

router = APIRouter(prefix="/enterprise", tags=["enterprise"])

def get_hr_admin(current_user=Depends(get_current_user)):
    if current_user['role'] not in ['hr_admin', 'it_admin']:
        raise HTTPException(status_code=403, detail="Not authorized for enterprise views")
    return current_user

@router.get("/command-center")
def get_command_center(current_user=Depends(get_hr_admin)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        
        # 1. Total New Hires
        cursor.execute("SELECT COUNT(*) FROM USERS WHERE role = 'new_hire'")
        total_hires = cursor.fetchone()[0]
        
        # 2. Risk Levels
        cursor.execute("SELECT risk_level, COUNT(*) FROM USERS WHERE role = 'new_hire' GROUP BY risk_level")
        risks = {r[0]: r[1] for r in cursor.fetchall()}
        
        # 3. SLA Breaches (Tasks & Docs overdue)
        cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE status != 'Completed' AND due_date < CURRENT_DATE")
        overdue_tasks = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM DOCUMENTS WHERE status = 'Pending' AND sla_due_date < CURRENT_DATE")
        overdue_docs = cursor.fetchone()[0]
        
        # 4. Pipeline stages
        cursor.execute("SELECT onboarding_status, COUNT(*) FROM USERS WHERE role = 'new_hire' GROUP BY onboarding_status")
        pipeline = {r[0]: r[1] for r in cursor.fetchall()}

        return {
            "total_hires": total_hires,
            "risk_levels": risks,
            "sla_breaches": overdue_tasks + overdue_docs,
            "pipeline": pipeline,
            "overdue_tasks": overdue_tasks,
            "overdue_docs": overdue_docs
        }
    finally:
        db.release_connection(conn)

@router.get("/employee-360/{user_id}")
def get_employee_360(user_id: int, current_user=Depends(get_hr_admin)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        
        # User details
        cursor.execute("""
            SELECT u.user_id, u.name, u.email, u.joining_date, u.onboarding_status, u.risk_level, d.name 
            FROM USERS u LEFT JOIN DEPARTMENTS d ON u.department_id = d.department_id 
            WHERE u.user_id = :1
        """, [user_id])
        u = cursor.fetchone()
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
            
        user_info = {
            "user_id": u[0], "name": u[1], "email": u[2], "joining_date": u[3],
            "onboarding_status": u[4], "risk_level": u[5], "department": u[6]
        }
        
        # Timeline
        cursor.execute("""
            SELECT event_id, event_type, action_taken, status, next_action, due_date, created_at 
            FROM ONBOARDING_TIMELINE WHERE user_id = :1 ORDER BY created_at DESC
        """, [user_id])
        timeline = [{"event_id": r[0], "type": r[1], "action": r[2], "status": r[3], "next_action": r[4], "due_date": r[5], "created_at": r[6]} for r in cursor.fetchall()]
        
        # Tasks
        cursor.execute("""
            SELECT ta.assignment_id, t.title, ta.status, ta.due_date 
            FROM TASK_ASSIGNMENTS ta JOIN ONBOARDING_TASKS t ON ta.task_id = t.task_id 
            WHERE ta.user_id = :1
        """, [user_id])
        tasks = [{"id": r[0], "title": r[1], "status": r[2], "due_date": r[3]} for r in cursor.fetchall()]
        
        return {
            "user": user_info,
            "timeline": timeline,
            "tasks": tasks
        }
    finally:
        db.release_connection(conn)

@router.get("/risk-monitoring")
def get_risk_monitoring(current_user=Depends(get_hr_admin)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id, name, email, risk_level, onboarding_status 
            FROM USERS 
            WHERE role = 'new_hire' AND (risk_level IN ('High', 'Medium') OR onboarding_status = 'Blocked')
            ORDER BY risk_level
        """)
        return [{"user_id": r[0], "name": r[1], "email": r[2], "risk": r[3], "status": r[4]} for r in cursor.fetchall()]
    finally:
        db.release_connection(conn)

@router.get("/approval-center")
def get_approval_center(current_user=Depends(get_hr_admin)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT d.doc_id, d.doc_type, u.name as employee_name, d.uploaded_at, d.sla_due_date,
                   (CASE WHEN d.sla_due_date < CURRENT_DATE THEN 1 ELSE 0 END) as is_breached
            FROM DOCUMENTS d JOIN USERS u ON d.user_id = u.user_id
            WHERE d.status = 'Pending'
            ORDER BY d.sla_due_date ASC NULLS LAST
        """)
        return [{"doc_id": r[0], "doc_type": r[1], "employee_name": r[2], "uploaded_at": r[3], "sla_due_date": r[4], "is_breached": bool(r[5])} for r in cursor.fetchall()]
    finally:
        db.release_connection(conn)

@router.get("/notifications")
def get_notifications(current_user=Depends(get_current_user)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT notif_id, type, message, action_link, is_read, created_at
            FROM notifications
            WHERE user_id = :1
            ORDER BY created_at DESC
        """, [current_user['user_id']])
        return [{"id": r[0], "type": r[1], "message": r[2], "action_link": r[3], "is_read": bool(r[4]), "created_at": r[5]} for r in cursor.fetchall()]
    finally:
        db.release_connection(conn)

@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, current_user=Depends(get_current_user)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE notif_id = :1 AND user_id = :2", [notif_id, current_user['user_id']])
        conn.commit()
        return {"status": "success"}
    finally:
        db.release_connection(conn)

@router.get("/audit-trail")
def get_audit_trail(limit: int = 50, current_user=Depends(get_hr_admin)):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"""
            SELECT a.audit_id, a.entity_type, a.entity_id, a.action, a.old_value, a.new_value, u.name, a.created_at
            FROM audit_trail a
            LEFT JOIN users u ON a.changed_by = u.user_id
            ORDER BY a.created_at DESC
            FETCH FIRST {limit} ROWS ONLY
        """)
        return [{"audit_id": r[0], "entity_type": r[1], "entity_id": r[2], "action": r[3], "old_value": r[4], "new_value": r[5], "changed_by": r[6] or 'System', "created_at": r[7]} for r in cursor.fetchall()]
    finally:
        db.release_connection(conn)

@router.get("/ai-copilot/insights")
def get_copilot_insights(current_user=Depends(get_hr_admin)):
    # Simulates an AI reading from Oracle and generating insights
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        
        # Identify bottleneck department
        cursor.execute("""
            SELECT d.name, COUNT(*) as delayed
            FROM users u
            JOIN departments d ON u.department_id = d.department_id
            WHERE u.role = 'new_hire' AND u.risk_level IN ('High', 'Medium')
            GROUP BY d.name
            ORDER BY delayed DESC
            FETCH FIRST 1 ROWS ONLY
        """)
        bottleneck = cursor.fetchone()
        bottleneck_text = f"The {bottleneck[0]} department has the most delayed onboardings ({bottleneck[1]} employees)." if bottleneck else "All departments are performing well."

        # Identify most delayed task
        cursor.execute("""
            SELECT t.title, COUNT(*) as overdue
            FROM task_assignments ta
            JOIN onboarding_tasks t ON ta.task_id = t.task_id
            WHERE ta.status != 'Completed' AND ta.due_date < CURRENT_DATE
            GROUP BY t.title
            ORDER BY overdue DESC
            FETCH FIRST 1 ROWS ONLY
        """)
        worst_task = cursor.fetchone()
        task_text = f"The biggest bottleneck is '{worst_task[0]}' with {worst_task[1]} overdue assignments." if worst_task else "There are no overdue tasks."

        return {
            "insights": [
                {"type": "Risk", "text": bottleneck_text},
                {"type": "Operations", "text": task_text},
                {"type": "Recommendation", "text": "Consider re-allocating HR resources to clear the pending document verification queue to reduce SLA breaches."}
            ]
        }
    finally:
        db.release_connection(conn)
