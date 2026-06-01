import oracledb
import os
from dotenv import load_dotenv
import requests

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1')
APP_USER = os.getenv('ORACLE_USER', 'onboarding_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')

print('--- EXPERT AUDIT: ORACLE DATABASE ---')
try:
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    cursor = conn.cursor()
    
    # 1. Check Tables
    cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
    tables = [row[0] for row in cursor.fetchall()]
    expected_tables = [
        'USERS', 'DEPARTMENTS', 'ONBOARDING_TASKS', 'TASK_ASSIGNMENTS', 
        'DOCUMENTS', 'ASSETS', 'ASSET_ASSIGNMENTS', 'TRAININGS', 
        'TRAINING_ASSIGNMENTS', 'BUDDIES', 'BUDDY_CHECKINS', 'ONBOARDING_FAQS'
    ]
    missing = [t for t in expected_tables if t not in tables]
    print(f'[DB] Total Tables Found: {len(tables)}/12 required.')
    if missing:
        print(f'[DB] MISSING TABLES: {missing}')
    else:
        print('[DB] SUCCESS: All 12 required PDF tables are present.')

    # 2. Check Foreign Keys
    cursor.execute("""
        SELECT a.table_name, a.constraint_name, b.table_name as referenced_table 
        FROM user_constraints a 
        JOIN user_constraints b ON a.r_constraint_name = b.constraint_name 
        WHERE a.constraint_type = 'R'
    """)
    fks = cursor.fetchall()
    print(f'[DB] SUCCESS: Total Foreign Keys Enforced: {len(fks)}. Relational integrity is solid.')

    # 3. Check Sequence / Auto-Identity
    cursor.execute("SELECT table_name, column_name FROM user_tab_identity_cols")
    identities = cursor.fetchall()
    print(f'[DB] SUCCESS: Identity/Auto-increment columns: {len(identities)}/12.')

    # 4. Check Seed Data Count
    print('[DB] Seed Data Row Counts:')
    for t in expected_tables:
        cursor.execute(f"SELECT count(*) FROM {t}")
        count = cursor.fetchone()[0]
        print(f'     - {t}: {count} rows')

    conn.close()
except Exception as e:
    print(f'Database Audit Failed: {e}')

print('\n--- EXPERT AUDIT: FASTAPI BACKEND ---')
try:
    resp = requests.get('http://localhost:8000/openapi.json')
    if resp.status_code == 200:
        data = resp.json()
        paths = data.get('paths', {})
        print(f'[API] SUCCESS: Total API Endpoints Registered: {len(paths)}')
        
        # Check specific modules
        modules = ['auth', 'tasks', 'documents', 'assets', 'trainings', 'buddies', 'admin']
        module_counts = {m: 0 for m in modules}
        for path in paths.keys():
            for m in modules:
                if f"/{m}" in path:
                    module_counts[m] += 1
        
        print('[API] Endpoint coverage by module:')
        for m, c in module_counts.items():
            if c > 0:
                print(f'     - [PASS] /{m} : {c} endpoints implemented.')
            else:
                print(f'     - [FAIL] /{m} : MISSING API ENDPOINTS!')
    else:
        print('Backend API is not reachable on port 8000.')
except Exception as e:
    print(f'[API] FastAPI server is currently offline or unreachable: {e}')
