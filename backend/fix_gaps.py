import oracledb
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'ONBOARDING_USER')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1')

def fix_gaps():
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    cursor = conn.cursor()

    # 1. Add missing IT department (ID=4)
    try:
        cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (4, 'IT', 'Information Technology')")
        print("Added IT department (ID=4)")
    except Exception as e:
        if '00001' in str(e):  # unique constraint
            print("IT department already exists")
        else:
            print(f"Dept error: {e}")

    # 2. Add missing 5th task: "Set Up Corporate Email"
    try:
        cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (5, 'Set Up Corporate Email', 'IT Setup', 1, 1)")
        print("Added task 5: Set Up Corporate Email")
    except Exception as e:
        if '00001' in str(e):
            print("Task 5 already exists")
        else:
            print(f"Task error: {e}")

    # 3. Add 2 more FAQ entries from PDF
    faqs = [
        (5, "How do I apply for leaves?", "You can apply for leaves through the HR Portal. Freshers get 15 days of earned leave pro-rated for the first year.", "Policy", "leave holiday vacation sick days"),
        (6, "When will I get my ID card?", "Your ID card will be issued by the IT department on Day 1. Ensure you have submitted your passport photo during registration.", "IT Setup", "id card access badge photo")
    ]
    for faq in faqs:
        try:
            cursor.execute("INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (:1, :2, :3, :4, :5)", faq)
            print(f"Added FAQ {faq[0]}")
        except Exception as e:
            if '00001' in str(e):
                print(f"FAQ {faq[0]} already exists")
            else:
                print(f"FAQ error: {e}")

    # 4. Fix all password hashes to valid bcrypt for 'admin123'
    valid_hash = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')
    cursor.execute("UPDATE USERS SET password_hash = :1", [valid_hash])
    print(f"Updated {cursor.rowcount} user password hashes to valid bcrypt")

    conn.commit()

    # Verify counts
    for table in ['DEPARTMENTS', 'ONBOARDING_TASKS', 'TRAININGS', 'ASSETS', 'ONBOARDING_FAQS', 'USERS']:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"{table}: {cursor.fetchone()[0]} rows")

    conn.close()
    print("\nAll gaps fixed!")

if __name__ == "__main__":
    fix_gaps()
