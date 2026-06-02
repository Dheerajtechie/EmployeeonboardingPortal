from fastapi import APIRouter, Depends, HTTPException
import db
from services.auth_service import get_current_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/")
def get_my_notifications(conn = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT notif_id, type, message, action_link, metadata, is_read, created_at "
        "FROM NOTIFICATIONS WHERE user_id = :1 ORDER BY created_at DESC", [current_user["user_id"]]
    )
    
    notifications = []
    for row in cursor.fetchall():
        notifications.append({
            "notif_id": row[0],
            "type": row[1],
            "message": row[2],
            "action_link": row[3],
            "metadata": row[4],
            "is_read": bool(row[5]),
            "created_at": row[6]
        })
    return notifications

@router.put("/{notif_id}/read")
def mark_notification_read(notif_id: int, conn = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE NOTIFICATIONS SET is_read = 1 WHERE notif_id = :1 AND user_id = :2",
        [notif_id, current_user["user_id"]]
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    conn.commit()
    return {"message": "Marked as read"}

@router.post("/mark-all-read")
def mark_all_read(conn = Depends(db.get_db), current_user: dict = Depends(get_current_user)):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE NOTIFICATIONS SET is_read = 1 WHERE user_id = :1 AND is_read = 0",
        [current_user["user_id"]]
    )
    conn.commit()
    return {"message": "All marked as read"}
