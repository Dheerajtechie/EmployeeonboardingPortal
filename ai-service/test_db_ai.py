import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

USER = os.getenv("ORACLE_USER", "onboarding_user")
PASSWORD = os.getenv("ORACLE_PASSWORD", "onboarding123")
DSN = os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")

print(f"Connecting to {USER}@{DSN}...")
try:
    conn = oracledb.connect(user=USER, password=PASSWORD, dsn=DSN)
    print("Success!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
