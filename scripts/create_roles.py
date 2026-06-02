import oracledb
import bcrypt

c = oracledb.connect(user='onboarding_user', password='onboarding123', dsn='localhost:1521/XEPDB1')
cur = c.cursor()

pwd = bcrypt.hashpw('admin123'.encode(), bcrypt.gensalt()).decode()

cur.execute("""
    INSERT INTO USERS (name, email, password_hash, role, department_id, joining_date)
    VALUES ('IT Admin', 'it_admin@company.com', :1, 'it_admin', 1, CURRENT_DATE)
""", [pwd])

cur.execute("""
    INSERT INTO USERS (name, email, password_hash, role, department_id, joining_date)
    VALUES ('Buddy Mentor', 'buddy@company.com', :1, 'buddy', 1, CURRENT_DATE)
""", [pwd])

c.commit()
print("IT Admin and Buddy users created successfully!")
