import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# App User credentials
APP_USER = os.getenv('ORACLE_USER', 'onboarding_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1')

def add_test_users():
    try:
        print(f"Connecting as app user ({APP_USER})...")
        conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
        cursor = conn.cursor()

        # Bcrypt hash for 'admin123'
        password_hash = '$2b$12$6/7/L1.Qv/gN7yO.H.1/V.oVlR40oZ24N2P39i5C.QjY9N7L4tYh6'

        users_to_add = [
            (2, 'IT Admin', 'it_admin@company.com', password_hash, 'it_admin', 1),
            (3, 'Senior Buddy', 'buddy@company.com', password_hash, 'buddy', 1),
            (4, 'New Fresher', 'newhire@company.com', password_hash, 'new_hire', 1)
        ]

        for uid, name, email, pwd, role, dept in users_to_add:
            try:
                cursor.execute(
                    "INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (:1, :2, :3, :4, :5, :6, CURRENT_DATE)",
                    [uid, name, email, pwd, role, dept]
                )
                print(f"Added user: {email} ({role})")
            except oracledb.DatabaseError as e:
                error, = e.args
                if error.code == 1: # ORA-00001: unique constraint violated
                    print(f"User {email} already exists.")
                else:
                    print(f"Error adding {email}: {e}")

        conn.commit()
        
        # Now, assign some tasks to the new hire so their checklist isn't empty!
        print("Assigning tasks to newhire@company.com...")
        cursor.execute("SELECT task_id FROM ONBOARDING_TASKS")
        tasks = cursor.fetchall()
        for t in tasks:
            try:
                cursor.execute(
                    "INSERT INTO TASK_ASSIGNMENTS (task_id, user_id, status, due_date) VALUES (:1, 4, 'Pending', CURRENT_DATE + 7)",
                    [t[0]]
                )
            except Exception:
                pass # ignore if already assigned

        # Pair the new hire with the buddy
        try:
            cursor.execute(
                "INSERT INTO BUDDIES (new_hire_id, buddy_user_id, assigned_by) VALUES (4, 3, 1)"
            )
            print("Paired new hire with buddy.")
        except Exception:
            pass

        conn.commit()
        cursor.close()
        conn.close()
        print("Test users successfully configured!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    add_test_users()
