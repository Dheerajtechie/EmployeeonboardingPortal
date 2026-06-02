import oracledb

c=oracledb.connect(user='onboarding_user', password='onboarding123', dsn='localhost:1521/XEPDB1')
cursor=c.cursor()
cursor.execute("UPDATE USERS SET password_hash='$2b$12$Sk9v9z8CRioH.pNLzSzAWO5TvtVvysGzqkXB0rVILYqr.Rvnnn2Wm' WHERE email='hr_admin@company.com'")
c.commit()
print("Updated password!")
