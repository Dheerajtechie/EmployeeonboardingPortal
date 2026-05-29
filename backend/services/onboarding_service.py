import db


def get_completion_percentage(conn, user_id: int) -> int:
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE user_id = :1", [user_id])
    total = cursor.fetchone()[0]
    if total == 0:
        return 0
    cursor.execute("SELECT COUNT(*) FROM TASK_ASSIGNMENTS WHERE user_id = :1 AND status = 'Completed'", [user_id])
    done = cursor.fetchone()[0]
    return int((done / total) * 100)
