import oracledb
import os
from dotenv import load_dotenv
import time

load_dotenv()

# App User credentials
APP_USER = os.getenv('ORACLE_USER', 'onboarding_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XE')  # test_db.py found XE worked

print(f"Testing connection for {APP_USER} to {DSN}...")
start_time = time.time()
try:
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    elapsed = time.time() - start_time
    print(f"Connection successful! Latency: {elapsed*1000:.2f} ms")
    
    cursor = conn.cursor()
    
    # Test 1: Check Users
    cursor.execute("SELECT COUNT(*) FROM USERS")
    user_count = cursor.fetchone()[0]
    print(f"Users table exists. Count: {user_count}")
    
    # Test 2: Check Tasks
    cursor.execute("SELECT COUNT(*) FROM ONBOARDING_TASKS")
    task_count = cursor.fetchone()[0]
    print(f"Tasks table exists. Count: {task_count}")
    
    # Test 3: Check FAQs (used by AI service)
    cursor.execute("SELECT COUNT(*) FROM ONBOARDING_FAQS")
    faq_count = cursor.fetchone()[0]
    print(f"FAQs table exists. Count: {faq_count}")
    
    cursor.close()
    conn.close()
    print("All basic DB queries executed successfully.")
except Exception as e:
    print(f"Database error: {e}")
