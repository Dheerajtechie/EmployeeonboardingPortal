import oracledb
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('.env')

APP_USER = os.getenv('ORACLE_USER', 'onboarding_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1')

try:
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    cursor = conn.cursor()
    
    out_val = cursor.var(int)
    joining_date = datetime.now()
    cursor.execute(
        "INSERT INTO USERS (name, email, password_hash, role, department_id, joining_date) VALUES (:1, :2, :3, :4, :5, :6) RETURNING user_id INTO :7",
        ["Test User", "test4@test.com", "hash", "new_hire", 1, joining_date, out_val]
    )
    
    print("Success! user_id:", out_val.getvalue()[0])
    conn.rollback()
except Exception as e:
    print("Error:", e)
