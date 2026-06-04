import oracledb
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'onboard_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboard_pass')
DSN = os.getenv('ORACLE_DSN', '127.0.0.1:1522/FREEPDB1')

def update_users():
    try:
        conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
        cursor = conn.cursor()
        
        # Clear existing users except we can't if they have FKs, but we just seeded so no FKs probably.
        # Actually just delete from buddies, documents, task_assignments first.
        cursor.execute("DELETE FROM BUDDY_CHECKINS")
        cursor.execute("DELETE FROM BUDDIES")
        cursor.execute("DELETE FROM TASK_ASSIGNMENTS")
        cursor.execute("DELETE FROM ASSET_ASSIGNMENTS")
        cursor.execute("DELETE FROM TRAINING_ASSIGNMENTS")
        cursor.execute("DELETE FROM DOCUMENTS")
        cursor.execute("UPDATE DEPARTMENTS SET head_user_id = NULL")
        cursor.execute("DELETE FROM USERS")
        
        # Ensure IT department exists (department_id = 4)
        cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (4, 'IT', 'Information Technology')")
        
        valid_hash = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')
        
        # HR Admin: hr@portal.com
        cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (1, 'HR Admin', 'hr@portal.com', :1, 'hr_admin', 2, CURRENT_DATE)", [valid_hash])
        
        # IT Admin: it@portal.com
        cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (2, 'IT Admin', 'it@portal.com', :1, 'it_admin', 4, CURRENT_DATE)", [valid_hash])
        
        # Buddy: buddy@portal.com
        cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (3, 'Buddy Mentor', 'buddy@portal.com', :1, 'buddy', 1, CURRENT_DATE)", [valid_hash])
        
        # New Hire: hire@portal.com
        cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (4, 'New Hire', 'hire@portal.com', :1, 'new_hire', 1, CURRENT_DATE)", [valid_hash])
        
        # Assign a task to the new hire to test functionality
        cursor.execute("INSERT INTO TASK_ASSIGNMENTS (assignment_id, task_id, user_id, status, due_date) VALUES (assignment_seq.nextval, 1, 4, 'Pending', CURRENT_DATE + 2)")
        cursor.execute("INSERT INTO TASK_ASSIGNMENTS (assignment_id, task_id, user_id, status, due_date) VALUES (assignment_seq.nextval, 2, 4, 'Pending', CURRENT_DATE + 1)")
        cursor.execute("INSERT INTO TASK_ASSIGNMENTS (assignment_id, task_id, user_id, status, due_date) VALUES (assignment_seq.nextval, 3, 4, 'Pending', CURRENT_DATE + 5)")
        
        # Assign buddy
        cursor.execute("INSERT INTO BUDDIES (buddy_id, new_hire_id, buddy_user_id, assigned_by) VALUES (1, 4, 3, 1)")
        
        conn.commit()
        print("Users updated successfully to match PDF requirements!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    update_users()
