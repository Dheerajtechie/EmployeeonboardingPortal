import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'onboarding_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1') # Connect from inside container if needed, or via port forward

def run_migration():
    try:
        print("Connecting to DB for v3 Enterprise migration...")
        conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
        cursor = conn.cursor()

        migrations = [
            # 1. Expand DOCUMENTS
            "ALTER TABLE documents ADD expiration_date DATE",
            "ALTER TABLE documents ADD created_by NUMBER REFERENCES users(user_id)",
            "ALTER TABLE documents ADD updated_by NUMBER REFERENCES users(user_id)",
            
            # 2. Expand TRAINING_ASSIGNMENTS
            "ALTER TABLE training_assignments ADD started_at TIMESTAMP",
            "ALTER TABLE training_assignments ADD progress_percent NUMBER(3,0) DEFAULT 0",
            "ALTER TABLE training_assignments ADD certified_at TIMESTAMP",
            "ALTER TABLE training_assignments ADD expires_at DATE",

            # 3. Expand ASSET_ASSIGNMENTS
            "ALTER TABLE asset_assignments ADD return_date DATE",
            "ALTER TABLE asset_assignments ADD damaged_notes VARCHAR2(500)",
            "ALTER TABLE asset_assignments ADD acknowledgement_date TIMESTAMP",
            "ALTER TABLE asset_assignments ADD status VARCHAR2(50) DEFAULT 'Assigned'", # Reserved, Assigned, Delivered, Acknowledged, Returned, Damaged, Lost
            
            # 4. Create ASSET_LIFECYCLE_HISTORY
            "CREATE SEQUENCE asset_hist_seq START WITH 1 INCREMENT BY 1 NOCACHE",
            """CREATE TABLE asset_lifecycle_history (
                history_id       NUMBER          DEFAULT asset_hist_seq.NEXTVAL PRIMARY KEY,
                asset_id         NUMBER          NOT NULL REFERENCES assets(asset_id),
                user_id          NUMBER          REFERENCES users(user_id),
                status           VARCHAR2(50)    NOT NULL,
                notes            VARCHAR2(500),
                changed_by       NUMBER          REFERENCES users(user_id),
                created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
            )""",

            # 5. Create BUDDY_MEETINGS
            "CREATE SEQUENCE buddy_meet_seq START WITH 1 INCREMENT BY 1 NOCACHE",
            """CREATE TABLE buddy_meetings (
                meeting_id       NUMBER          DEFAULT buddy_meet_seq.NEXTVAL PRIMARY KEY,
                buddy_id         NUMBER          NOT NULL REFERENCES buddies(buddy_id),
                meeting_date     TIMESTAMP       NOT NULL,
                status           VARCHAR2(50)    DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
                meeting_notes    CLOB,
                effectiveness_score NUMBER(2,0),
                created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
            )""",
            
            # 6. SYSTEM_NOTIFICATIONS (Upgrading existing 'notifications' table to add state metadata)
            # Actually, `notifications` already exists, let's just add metadata column
            "ALTER TABLE notifications ADD metadata VARCHAR2(1000)"
        ]

        for sql in migrations:
            print(f"Executing: {sql[:60]}...")
            try:
                cursor.execute(sql)
                print("Success.")
            except Exception as e:
                print(f"Failed or already applied: {e}")

        conn.commit()
        cursor.close()
        conn.close()
        print("Migration v3 Enterprise complete!")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == '__main__':
    run_migration()
