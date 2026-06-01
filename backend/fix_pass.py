import oracledb
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'SYSTEM')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'system')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XE')

password = 'admin123'
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
cursor = conn.cursor()

cursor.execute("UPDATE USERS SET password_hash = :1 WHERE email = 'hr_admin@company.com'", [hashed])
conn.commit()

print("Password updated successfully.")
conn.close()
