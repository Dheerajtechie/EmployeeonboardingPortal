from fastapi import APIRouter, Depends, HTTPException
import db
from services.auth_service import get_current_user, require_role
from models.buddy import CheckinCreate, BuddyMeetingCreate, BuddyMeetingFeedback, BuddyMessage

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

@router.post("/meetings")
def schedule_meeting(data: BuddyMeetingCreate, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["buddy", "new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO BUDDY_MEETINGS (buddy_id, meeting_date, status) VALUES (:1, :2, 'Scheduled')",
        [data.buddy_id, data.meeting_date]
    )
    conn.commit()
    return {"message": "Meeting scheduled successfully"}

@router.put("/meetings/{meeting_id}/feedback")
def log_meeting_feedback(meeting_id: int, data: BuddyMeetingFeedback, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["buddy", "hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE BUDDY_MEETINGS SET meeting_notes = :1, effectiveness_score = :2, status = 'Completed' WHERE meeting_id = :3",
        [data.meeting_notes, data.effectiveness_score, meeting_id]
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    conn.commit()
    return {"message": "Feedback logged successfully"}

@router.get("/assigned")
def get_assigned_mentees(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["buddy"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT b.buddy_id, b.new_hire_id, u.name, u.email "
        "FROM BUDDIES b JOIN USERS u ON b.new_hire_id = u.user_id "
        "WHERE b.buddy_user_id = :1 AND b.is_active = 1", [current_user["user_id"]]
    )
    mentees = []
    for row in cursor.fetchall():
        cursor2 = conn.cursor()
        cursor2.execute("SELECT COUNT(*) FROM ONBOARDING_TASKS")
        total_tasks = cursor2.fetchone()[0] or 1
        cursor2.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE user_id = :1 AND status = 'Completed'", [row[1]])
        completed = cursor2.fetchone()[0] or 0
        mentees.append({
            "buddy_id": row[0],
            "user_id": row[1],
            "name": row[2],
            "email": row[3],
            "completion_percentage": int((completed / total_tasks) * 100) if total_tasks else 0
        })
    return mentees

@router.get("/meetings/assigned")
def get_assigned_meetings(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["buddy"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT m.meeting_id, m.buddy_id, m.meeting_date, m.status, m.meeting_notes, m.effectiveness_score, b.new_hire_id "
        "FROM BUDDY_MEETINGS m JOIN BUDDIES b ON m.buddy_id = b.buddy_id "
        "WHERE b.buddy_user_id = :1 ORDER BY m.meeting_date ASC", [current_user["user_id"]]
    )
    meetings = []
    for row in cursor.fetchall():
        meetings.append({
            "meeting_id": row[0],
            "buddy_id": row[1],
            "meeting_date": row[2],
            "status": row[3],
            "meeting_notes": row[4].read() if hasattr(row[4], 'read') else row[4],
            "effectiveness_score": row[5],
            "new_hire_id": row[6]
        })
    return meetings

@router.get("/meetings/{buddy_id}")
def get_meetings(buddy_id: int, conn = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT meeting_id, buddy_id, meeting_date, status, meeting_notes, effectiveness_score, created_at "
        "FROM BUDDY_MEETINGS WHERE buddy_id = :1 ORDER BY meeting_date ASC", [buddy_id]
    )
    meetings = []
    for row in cursor.fetchall():
        meetings.append({
            "meeting_id": row[0],
            "buddy_id": row[1],
            "meeting_date": row[2],
            "status": row[3],
            "meeting_notes": row[4].read() if hasattr(row[4], 'read') else row[4],
            "effectiveness_score": row[5],
            "created_at": row[6]
        })
    return meetings

@router.post("/message")
def send_message(data: BuddyMessage, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire", "buddy"]))):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO NOTIFICATIONS (user_id, message, type) VALUES (:1, :2, 'Message')",
        [data.recipient_id, f"Message from {current_user['name']}: {data.message}"]
    )
    conn.commit()
    return {"message": "Message sent successfully"}
