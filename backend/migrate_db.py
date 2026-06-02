import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'onboarding_user')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'host.docker.internal:1521/XEPDB1') # Connect from inside container

def run_migration():
    try:
        print("Connecting to DB...")
        conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
        cursor = conn.cursor()

        migrations = [
            "ALTER TABLE USERS ADD (onboarding_status VARCHAR2(50) DEFAULT 'In Progress', risk_level VARCHAR2(20) DEFAULT 'Low')",
            "ALTER TABLE TASK_ASSIGNMENTS ADD (sla_due_date DATE, responsible_owner NUMBER)",
            "ALTER TABLE TASK_ASSIGNMENTS ADD CONSTRAINT fk_ta_owner FOREIGN KEY (responsible_owner) REFERENCES USERS(user_id)",
            "ALTER TABLE DOCUMENTS ADD (sla_due_date DATE, responsible_owner NUMBER)",
            "ALTER TABLE DOCUMENTS ADD CONSTRAINT fk_doc_owner FOREIGN KEY (responsible_owner) REFERENCES USERS(user_id)",
            "CREATE SEQUENCE timeline_seq START WITH 1 INCREMENT BY 1 NOCACHE",
            """CREATE TABLE ONBOARDING_TIMELINE (
                event_id NUMBER DEFAULT timeline_seq.NEXTVAL PRIMARY KEY,
                user_id NUMBER NOT NULL REFERENCES users(user_id),
                event_type VARCHAR2(100) NOT NULL,
                action_taken VARCHAR2(500) NOT NULL,
                status VARCHAR2(50),
                next_action VARCHAR2(500),
                responsible_owner NUMBER REFERENCES users(user_id),
                due_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )"""
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
        print("Migration complete!")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == '__main__':
    run_migration()
