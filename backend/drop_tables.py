import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'SYSTEM')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'system')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XE')

tables_to_drop = [
    "ASSET_ASSIGNMENTS", "ASSETS", "DOCUMENTS", "BUDDY_CHECKINS", "BUDDIES",
    "TRAINING_ASSIGNMENTS", "TRAININGS", "TASK_ASSIGNMENTS", "ONBOARDING_TASKS",
    "ONBOARDING_FAQS", "USERS", "DEPARTMENTS"
]

try:
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    cursor = conn.cursor()
    for table in tables_to_drop:
        try:
            cursor.execute(f"DROP TABLE {table} CASCADE CONSTRAINTS")
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Could not drop {table}: {e}")
    conn.commit()
    conn.close()
    print("Drop complete.")
except Exception as e:
    print(f"Connection failed: {e}")
