import oracledb
import os
import bcrypt
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

APP_USER = os.getenv('ORACLE_USER', 'ONBOARDING_USER')
APP_PASSWORD = os.getenv('ORACLE_PASSWORD', 'onboarding123')
DSN = os.getenv('ORACLE_DSN', '127.0.0.1:1521/XEPDB1')

def restore():
    print("Restoring database...")
    conn = oracledb.connect(user=APP_USER, password=APP_PASSWORD, dsn=DSN)
    cursor = conn.cursor()
    
    # 1. Delete all existing data in reverse dependency order
    tables = [
        "AUDIT_TRAIL", "NOTIFICATIONS", "ONBOARDING_TIMELINE", "ONBOARDING_FAQS", 
        "BUDDY_CHECKINS", "BUDDIES", "TRAINING_ASSIGNMENTS", "TRAININGS",
        "ASSET_ASSIGNMENTS", "ASSETS", "DOCUMENTS", "TASK_ASSIGNMENTS", "ONBOARDING_TASKS"
    ]
    for table in tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
        except Exception as e:
            print(f"Skipping {table}: {e}")
            
    try:
        cursor.execute("UPDATE DEPARTMENTS SET head_user_id = NULL")
        cursor.execute("DELETE FROM USERS")
        cursor.execute("DELETE FROM DEPARTMENTS")
    except Exception as e:
        print(f"Error clearing users/depts: {e}")
        
    conn.commit()
    print("Database cleared.")

    valid_hash = bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8')

    # 2. Re-insert seed_data.sql content
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (1, 'Engineering', 'Tech & Dev teams')")
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (2, 'HR', 'Human Resources')")
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (3, 'Finance', 'Finance & Accounts')")
    cursor.execute("INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (4, 'IT', 'Information Technology')")

    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (101, 'Admin User', 'hr_admin@company.com', :1, 'hr_admin', 2, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (102, 'IT Admin', 'it_admin@company.com', :1, 'it_admin', 4, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (103, 'Jane Doe', 'jane.doe@company.com', :1, 'new_hire', 1, CURRENT_DATE)", [valid_hash])

    cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (1, 'Submit Aadhaar & PAN Card', 'Document', 2, 1)")
    cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (2, 'Collect Laptop from IT', 'IT Setup', 1, 1)")
    cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (3, 'Complete Security Awareness Training', 'Training', 5, 1)")
    cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (4, 'Read and Sign Code of Conduct', 'Policy', 3, 1)")
    cursor.execute("INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (5, 'Set Up Corporate Email', 'IT Setup', 1, 1)")

    cursor.execute("INSERT INTO TRAININGS (training_id, title, description, duration_hours, resource_url, is_mandatory) VALUES (1, 'Code of Conduct', 'Company ethics and behaviour policy', 1, 'http://lms/coc', 1)")
    cursor.execute("INSERT INTO TRAININGS (training_id, title, description, duration_hours, resource_url, is_mandatory) VALUES (2, 'Security Awareness', 'Data and cyber security training', 2, 'http://lms/sec', 1)")

    cursor.execute("INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (1, 'What documents do I need on Day 1?', 'Please bring Aadhaar card...', 'Documents', 'document day 1')")
    cursor.execute("INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (2, 'How do I get my laptop?', 'Visit the IT Help Desk on Floor 3...', 'IT Setup', 'laptop')")
    cursor.execute("INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (3, 'What is the WFH policy for new hires?', 'New hires are required to work from office for the first 90 days.', 'Policy', 'wfh')")
    cursor.execute("INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (4, 'Who is my buddy and what do they do?', 'Your buddy is an experienced colleague assigned to help you settle in.', 'General', 'buddy')")

    cursor.execute("INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (1, 'ThinkPad T14', 'SN-THNK-001', 'Hardware', 'New', 'Available')")
    cursor.execute("INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (2, 'MacBook Pro 14', 'SN-MAC-001', 'Hardware', 'Good', 'Available')")
    cursor.execute("INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (3, 'Dell UltraSharp Monitor', 'SN-MON-001', 'Peripherals', 'New', 'Available')")

    # 3. Add PDF required users
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (1, 'HR PDF', 'hr@portal.com', :1, 'hr_admin', 2, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (2, 'IT PDF', 'it@portal.com', :1, 'it_admin', 4, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (3, 'Buddy PDF', 'buddy@portal.com', :1, 'buddy', 1, CURRENT_DATE)", [valid_hash])
    cursor.execute("INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) VALUES (4, 'Hire PDF', 'hire@portal.com', :1, 'new_hire', 1, CURRENT_DATE)", [valid_hash])

    # Assign some tasks and a buddy to new hires
    cursor.execute("INSERT INTO TASK_ASSIGNMENTS (assignment_id, task_id, user_id, status, due_date) VALUES (assignment_seq.nextval, 1, 4, 'Pending', CURRENT_DATE + 2)")
    cursor.execute("INSERT INTO TASK_ASSIGNMENTS (assignment_id, task_id, user_id, status, due_date) VALUES (assignment_seq.nextval, 1, 103, 'Pending', CURRENT_DATE + 2)")

    cursor.execute("INSERT INTO BUDDIES (buddy_id, new_hire_id, buddy_user_id, assigned_by) VALUES (1, 4, 3, 1)")
    
    conn.commit()
    print("Database restored successfully with valid admin123 passwords!")

if __name__ == '__main__':
    restore()
