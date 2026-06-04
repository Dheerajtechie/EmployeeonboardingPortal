import app

import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
conn = oracledb.connect(
    user=os.getenv("ORACLE_USER", "ONBOARDING_USER"),
    password=os.getenv("ORACLE_PASSWORD", "onboarding123"),
    dsn=os.getenv("ORACLE_DSN", "localhost:1521/XEPDB1")
)
cur = conn.cursor()
cur.execute("SELECT user_id FROM USERS WHERE email = 'hire@portal.com'")
uid = cur.fetchone()[0]
conn.close()

with app.app.test_request_context(
    '/chatbot/ask', 
    method='POST', 
    json={'query': 'What tasks do I have pending?', 'user_id': uid}
):
    try:
        res = app.ask_chatbot()
        print(res.get_json())
    except Exception as e:
        import traceback
        traceback.print_exc()
