import app

uid = 26 # I need the correct user ID for Melly. Let me just get it inside the script.
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
cur.execute("SELECT user_id FROM USERS WHERE email = 'melly@gmail.com'")
uid = cur.fetchone()[0]
conn.close()

try:
    print(app.get_user_realtime_context(uid))
except Exception as e:
    import traceback
    traceback.print_exc()
