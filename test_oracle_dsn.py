import oracledb
import os
from dotenv import load_dotenv

load_dotenv()

user = os.getenv('ORACLE_USER', 'ONBOARDING_USER')
password = os.getenv('ORACLE_PASSWORD', 'onboarding123')

dsns = ["localhost:1521/XE", "localhost:1521/XEPDB1", "localhost:1521/ORCLCDB"]
for dsn in dsns:
    print(f"Trying DSN: {dsn} with user {user}")
    try:
        conn = oracledb.connect(user=user, password=password, dsn=dsn)
        print(f"SUCCESS with DSN: {dsn}")
        conn.close()
        break
    except Exception as e:
        print(f"FAILED: {e}")
