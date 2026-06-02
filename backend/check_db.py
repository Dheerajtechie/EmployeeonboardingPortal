import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

conn = oracledb.connect(
    user=os.getenv("ORACLE_USER", "ONBOARDING_USER"),
    password=os.getenv("ORACLE_PASSWORD", "onboarding123"),
    dsn=os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")
)

cur = conn.cursor()
tables = ["USERS", "ONBOARDING_FAQS", "ASSETS", "ASSET_ASSIGNMENTS", "BUDDIES", "DOCUMENTS", "NOTIFICATIONS", "TASKS", "TRAININGS"]

for t in tables:
    try:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        count = cur.fetchone()[0]
        print(f"Table {t}: {count} rows")
    except Exception as e:
        print(f"Table {t} error: {e}")

conn.close()
