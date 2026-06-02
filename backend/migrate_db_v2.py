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
            "CREATE SEQUENCE notif_seq START WITH 1 INCREMENT BY 1 NOCACHE",
            "CREATE SEQUENCE audit_seq START WITH 1 INCREMENT BY 1 NOCACHE",
            """CREATE TABLE notifications (
                notif_id         NUMBER          DEFAULT notif_seq.NEXTVAL PRIMARY KEY,
                user_id          NUMBER          NOT NULL REFERENCES users(user_id),
                type             VARCHAR2(100)   NOT NULL,
                message          VARCHAR2(500)   NOT NULL,
                action_link      VARCHAR2(500),
                is_read          NUMBER(1)       DEFAULT 0,
                created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
            )""",
            """CREATE TABLE audit_trail (
                audit_id         NUMBER          DEFAULT audit_seq.NEXTVAL PRIMARY KEY,
                entity_type      VARCHAR2(100)   NOT NULL,
                entity_id        NUMBER          NOT NULL,
                action           VARCHAR2(100)   NOT NULL,
                old_value        VARCHAR2(500),
                new_value        VARCHAR2(500),
                changed_by       NUMBER          REFERENCES users(user_id),
                created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
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
        print("Migration v2 complete!")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == '__main__':
    run_migration()
