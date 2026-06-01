import oracledb

dsns = ["localhost:1521/XE", "localhost:1521/XEPDB1", "localhost:1521/ORCLCDB"]
for dsn in dsns:
    print(f"Trying DSN: {dsn}")
    try:
        conn = oracledb.connect(user="SYSTEM", password="system", dsn=dsn)
        print(f"SUCCESS with DSN: {dsn}")
        conn.close()
        break
    except Exception as e:
        print(f"FAILED: {e}")
