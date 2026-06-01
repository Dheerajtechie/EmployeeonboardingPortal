import oracledb
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'ONBOARDING_USER')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1')

def reset_seed_data():
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    cursor = conn.cursor()

    print("Cleaning up existing data...")
    # Disable constraints or just delete in correct order
    tables = ['BUDDY_CHECKINS', 'BUDDIES', 'TRAINING_ASSIGNMENTS', 'ASSET_ASSIGNMENTS', 'TASK_ASSIGNMENTS', 'DOCUMENTS', 'ONBOARDING_FAQS', 'TRAININGS', 'ASSETS', 'ONBOARDING_TASKS']
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
    
    # Can't easily delete users/departments because of FK cycle.
    # Nullify head_user_id
    cursor.execute("UPDATE DEPARTMENTS SET head_user_id = NULL")
    cursor.execute("DELETE FROM USERS")
    cursor.execute("DELETE FROM DEPARTMENTS")

    print("Resetting sequences...")
    seqs = ['dept_seq', 'user_seq', 'task_seq', 'faq_seq', 'training_seq', 'asset_seq']
    for seq in seqs:
        try:
            cursor.execute(f"DROP SEQUENCE {seq}")
        except:
            pass
        cursor.execute(f"CREATE SEQUENCE {seq} START WITH 1 INCREMENT BY 1 NOCACHE")

    print("Seeding fresh data...")
    # Departments
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (dept_seq.nextval, 'Engineering', 'Tech & Dev teams')")
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (dept_seq.nextval, 'HR', 'Human Resources')")
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (dept_seq.nextval, 'Finance', 'Finance & Accounts')")
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (dept_seq.nextval, 'IT', 'Information Technology')")

    # Users
    valid_hash = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (user_seq.nextval, 'Admin User', 'hr_admin@company.com', :1, 'hr_admin', 2, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (user_seq.nextval, 'IT Admin', 'it_admin@company.com', :1, 'it_admin', 4, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (user_seq.nextval, 'Jane Doe', 'jane.doe@company.com', :1, 'new_hire', 1, CURRENT_DATE)", [valid_hash])

    # Tasks
    tasks = [
        ('Submit Aadhaar & PAN Card', 'Document', 2),
        ('Collect Laptop from IT', 'IT Setup', 1),
        ('Complete Security Awareness Training', 'Training', 5),
        ('Read and Sign Code of Conduct', 'Policy', 3),
        ('Set Up Corporate Email', 'IT Setup', 1)
    ]
    for t in tasks:
        cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (task_seq.nextval, :1, :2, :3, 1)", t)

    # Trainings
    cursor.execute("INSERT INTO TRAININGS (training_id, title, description, duration_hours, resource_url, is_mandatory) VALUES (training_seq.nextval, 'Code of Conduct', 'Company ethics and behaviour policy', 1, 'http://lms/coc', 1)")
    cursor.execute("INSERT INTO TRAININGS (training_id, title, description, duration_hours, resource_url, is_mandatory) VALUES (training_seq.nextval, 'Security Awareness', 'Data and cyber security training', 2, 'http://lms/sec', 1)")

    # Assets
    cursor.execute("INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (asset_seq.nextval, 'ThinkPad T14', 'SN-THNK-001', 'Hardware', 'New', 'Available')")
    cursor.execute("INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (asset_seq.nextval, 'MacBook Pro 14', 'SN-MAC-001', 'Hardware', 'Good', 'Available')")
    cursor.execute("INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (asset_seq.nextval, 'Dell UltraSharp Monitor', 'SN-MON-001', 'Peripherals', 'New', 'Available')")

    # FAQs
    faqs = [
        ('What documents do I need on Day 1?', 'Please bring Aadhaar card, PAN card, last degree certificate (original + copy), 2 passport photos, and bank account details for salary processing.', 'Documents', 'document day 1 submit aadhaar pan'),
        ('How do I get my laptop?', 'Visit the IT Help Desk on Floor 3 on Day 1 with your employee ID. Your laptop will be pre-configured. Collect it between 9 AM and 11 AM.', 'IT Setup', 'laptop computer macbook windows it help desk'),
        ('What is the WFH policy for new hires?', 'New hires are required to work from office for the first 90 days. After that, WFH is allowed up to 2 days per week with manager approval.', 'Policy', 'wfh work from home remote policy days'),
        ('Who is my buddy and what do they do?', 'Your buddy is an experienced colleague assigned to help you settle in. They will check in with you weekly for the first 3 months. See the Buddy tab for their contact.', 'General', 'buddy mentor contact help guide'),
        ("How do I apply for leaves?", "You can apply for leaves through the HR Portal. Freshers get 15 days of earned leave pro-rated for the first year.", "Policy", "leave holiday vacation sick days"),
        ("When will I get my ID card?", "Your ID card will be issued by the IT department on Day 1. Ensure you have submitted your passport photo during registration.", "IT Setup", "id card access badge photo")
    ]
    for f in faqs:
        cursor.execute("INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (faq_seq.nextval, :1, :2, :3, :4)", f)

    conn.commit()
    conn.close()
    print("Seed data completely reset and perfect!")

if __name__ == "__main__":
    reset_seed_data()
