import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'ONBOARDING_USER')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1')

print(f"Running health check for {APP_USER} at {DSN}...\n")

def check_health():
    try:
        conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
        cursor = conn.cursor()
        print("PASS - Oracle Connection: SUCCESS")
        
        cursor.execute("SELECT table_name FROM user_tables")
        tables = [r[0] for r in cursor.fetchall()]
        expected_tables = ["USERS", "DEPARTMENTS", "ONBOARDING_TASKS", "TASK_ASSIGNMENTS", "DOCUMENTS", "ASSETS", "ASSET_ASSIGNMENTS", "TRAININGS", "TRAINING_ASSIGNMENTS", "BUDDIES", "BUDDY_CHECKINS", "ONBOARDING_FAQS"]
        
        missing = [t for t in expected_tables if t not in tables]
        if missing:
            print(f"FAIL - Tables check: FAILED. Missing: {missing}")
        else:
            print(f"PASS - Tables check: SUCCESS ({len(tables)} tables found)")
            
        cursor.execute("SELECT constraint_name FROM user_constraints WHERE constraint_type = 'R'")
        fks = cursor.fetchall()
        if len(fks) > 0:
            print(f"PASS - Foreign Keys check: SUCCESS ({len(fks)} FKs enforced)")
        else:
            print(f"FAIL - Foreign Keys check: FAILED (No FKs found)")
            
        cursor.execute("SELECT COUNT(*) FROM USERS")
        users_count = cursor.fetchone()[0]
        if users_count > 0:
            print(f"PASS - Seed Data check: SUCCESS ({users_count} users seeded)")
        else:
            print("FAIL - Seed Data check: FAILED (No users found)")
            
        conn.close()
    except Exception as e:
        print(f"FAIL - Oracle Connection: FAILED\n{e}")

if __name__ == "__main__":
    check_health()
