import oracledb

# 1. Drop tables from XE (SYSTEM)
print("Connecting to XE to drop old tables...")
try:
    conn_xe = oracledb.connect(user="SYSTEM", password="system", dsn="localhost:1521/XE")
    cursor_xe = conn_xe.cursor()
    tables_to_drop = [
        "ASSET_ASSIGNMENTS", "ASSETS", "DOCUMENTS", "BUDDY_CHECKINS", "BUDDIES",
        "TRAINING_ASSIGNMENTS", "TRAININGS", "TASK_ASSIGNMENTS", "ONBOARDING_TASKS",
        "ONBOARDING_FAQS", "USERS", "DEPARTMENTS"
    ]
    for table in tables_to_drop:
        try:
            cursor_xe.execute(f"DROP TABLE {table} CASCADE CONSTRAINTS")
            print(f"Dropped {table} from XE")
        except Exception as e:
            pass # ignore if doesn't exist
    conn_xe.commit()
    conn_xe.close()
except Exception as e:
    print(f"Error connecting to XE: {e}")

# 2. Connect to XEPDB1 as SYSTEM and create ONBOARDING_USER
print("\nConnecting to XEPDB1 to create ONBOARDING_USER...")
try:
    conn_pdb = oracledb.connect(user="SYSTEM", password="system", dsn="localhost:1521/XEPDB1")
    cursor_pdb = conn_pdb.cursor()
    
    # Check if user exists
    try:
        cursor_pdb.execute("DROP USER ONBOARDING_USER CASCADE")
        print("Dropped existing ONBOARDING_USER.")
    except Exception as e:
        pass # ignore if doesn't exist

    print("Creating ONBOARDING_USER...")
    cursor_pdb.execute("CREATE USER ONBOARDING_USER IDENTIFIED BY onboarding123")
    cursor_pdb.execute("GRANT CONNECT, RESOURCE, DBA TO ONBOARDING_USER")
    cursor_pdb.execute("GRANT UNLIMITED TABLESPACE TO ONBOARDING_USER")
    conn_pdb.commit()
    conn_pdb.close()
    print("User ONBOARDING_USER created successfully in XEPDB1!")
except Exception as e:
    print(f"Error setting up XEPDB1: {e}")
