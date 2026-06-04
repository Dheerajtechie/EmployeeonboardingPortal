import cx_Oracle
import os
import datetime

conn = cx_Oracle.connect("ONBOARDING_USER/onboarding123@localhost:1521/XEPDB1")
cursor = conn.cursor()

try:
    out_val = cursor.var(int)
    cursor.execute(
        "INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (user_seq.nextval, :1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD')) RETURNING user_id INTO :7",
        ['Test Name', 'test1@portal.com', 'hash', 'new_hire', 1, '2026-06-10', out_val]
    )
    print("Inserted ID:", out_val.getvalue())
    conn.commit()
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
