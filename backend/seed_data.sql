-- ============================================================
-- Employee Onboarding Portal — Oracle Seed Data (DML)
-- ============================================================

INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (1, 'Engineering', 'Tech & Dev teams');
INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (2, 'HR', 'Human Resources');
INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (3, 'Finance', 'Finance & Accounts');
INSERT INTO DEPARTMENTS (department_id, name, description) VALUES (4, 'IT', 'Information Technology');

-- Seed HR Admin
INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) 
VALUES (1, 'Admin User', 'hr_admin@company.com', '$2b$12$R.O.648c69lJc/Y.L8l66unvHq.N1z25h3o.gTqOa.e9zXlQz.J7.', 'hr_admin', 2, CURRENT_DATE);

-- Seed IT Admin
INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) 
VALUES (2, 'IT Admin', 'it_admin@company.com', '$2b$12$R.O.648c69lJc/Y.L8l66unvHq.N1z25h3o.gTqOa.e9zXlQz.J7.', 'it_admin', 4, CURRENT_DATE);

-- Sample Employee
INSERT INTO USERS (user_id, name, email, password_hash, role, department_id, joining_date) 
VALUES (3, 'Jane Doe', 'jane.doe@company.com', '$2b$12$R.O.648c69lJc/Y.L8l66unvHq.N1z25h3o.gTqOa.e9zXlQz.J7.', 'new_hire', 1, CURRENT_DATE);

-- Onboarding Tasks
INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (1, 'Submit Aadhaar & PAN Card', 'Document', 2, 1);
INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (2, 'Collect Laptop from IT', 'IT Setup', 1, 1);
INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (3, 'Complete Security Awareness Training', 'Training', 5, 1);
INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (4, 'Read and Sign Code of Conduct', 'Policy', 3, 1);
INSERT INTO ONBOARDING_TASKS (task_id, title, category, default_due_days, is_mandatory) VALUES (5, 'Set Up Corporate Email', 'IT Setup', 1, 1);

-- Trainings
INSERT INTO TRAININGS (training_id, title, description, duration_hours, resource_url, is_mandatory) VALUES (1, 'Code of Conduct', 'Company ethics and behaviour policy', 1, 'http://lms/coc', 1);
INSERT INTO TRAININGS (training_id, title, description, duration_hours, resource_url, is_mandatory) VALUES (2, 'Security Awareness', 'Data and cyber security training', 2, 'http://lms/sec', 1);

-- FAQs
INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (1, 'What documents do I need on Day 1?', 'Please bring Aadhaar card, PAN card, last degree certificate (original + copy), 2 passport photos, and bank account details for salary processing.', 'Documents', 'document day 1 submit aadhaar pan');
INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (2, 'How do I get my laptop?', 'Visit the IT Help Desk on Floor 3 on Day 1 with your employee ID. Your laptop will be pre-configured. Collect it between 9 AM and 11 AM.', 'IT Setup', 'laptop computer macbook windows it help desk');
INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (3, 'What is the WFH policy for new hires?', 'New hires are required to work from office for the first 90 days. After that, WFH is allowed up to 2 days per week with manager approval.', 'Policy', 'wfh work from home remote policy days');
INSERT INTO ONBOARDING_FAQS (faq_id, question, answer, category, keywords) VALUES (4, 'Who is my buddy and what do they do?', 'Your buddy is an experienced colleague assigned to help you settle in. They will check in with you weekly for the first 3 months. See the Buddy tab for their contact.', 'General', 'buddy mentor contact help guide');

-- Assets
INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (1, 'ThinkPad T14', 'SN-THNK-001', 'Hardware', 'New', 'Available');
INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (2, 'MacBook Pro 14', 'SN-MAC-001', 'Hardware', 'Good', 'Available');
INSERT INTO ASSETS (asset_id, name, serial_number, category, condition, status) VALUES (3, 'Dell UltraSharp Monitor', 'SN-MON-001', 'Peripherals', 'New', 'Available');

COMMIT;
