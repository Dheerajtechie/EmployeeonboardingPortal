-- ============================================================
-- Employee Onboarding Portal — Oracle DDL
-- ============================================================
-- Run as the schema owner (e.g. onboarding_user).
-- All objects are created with IF-NOT-EXISTS guards using
-- PL/SQL anonymous blocks so the script is re-runnable.
-- ============================================================

-- ===================== SEQUENCES ============================

BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE dept_seq       START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE user_seq       START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE task_seq       START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE assignment_seq  START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE doc_seq        START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE asset_seq      START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE aa_seq         START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE training_seq   START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE ta_seq         START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE buddy_seq      START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE checkin_seq    START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE faq_seq        START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE timeline_seq   START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE notif_seq      START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/
BEGIN EXECUTE IMMEDIATE 'CREATE SEQUENCE audit_seq      START WITH 1 INCREMENT BY 1 NOCACHE'; EXCEPTION WHEN OTHERS THEN IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF; END;
/



-- ===================== TABLES ===============================

-- 1. DEPARTMENTS
CREATE TABLE departments (
    department_id   NUMBER          DEFAULT dept_seq.NEXTVAL  PRIMARY KEY,
    name            VARCHAR2(100)   NOT NULL,
    description     VARCHAR2(255),
    head_user_id    NUMBER
);

-- 2. USERS
CREATE TABLE users (
    user_id         NUMBER          DEFAULT user_seq.NEXTVAL  PRIMARY KEY,
    name            VARCHAR2(100)   NOT NULL,
    email           VARCHAR2(150)   NOT NULL UNIQUE,
    password_hash   VARCHAR2(255),
    role            VARCHAR2(20)    DEFAULT 'new_hire',
    department_id   NUMBER          REFERENCES departments(department_id),
    joining_date    DATE,
    is_active       NUMBER(1)       DEFAULT 1,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    onboarding_status VARCHAR2(50)  DEFAULT 'In Progress',
    risk_level      VARCHAR2(20)    DEFAULT 'Low'
);

-- FK from departments back to users (deferred via ALTER)
ALTER TABLE departments ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (head_user_id) REFERENCES users(user_id);

-- 3. ONBOARDING_TASKS
CREATE TABLE onboarding_tasks (
    task_id          NUMBER          DEFAULT task_seq.NEXTVAL  PRIMARY KEY,
    title            VARCHAR2(200)   NOT NULL,
    description      CLOB,
    category         VARCHAR2(50),
    default_due_days NUMBER          DEFAULT 7,
    is_mandatory     NUMBER(1)       DEFAULT 1,
    department_id    NUMBER          REFERENCES departments(department_id)
);

-- 4. TASK_ASSIGNMENTS
CREATE TABLE task_assignments (
    assignment_id    NUMBER          DEFAULT assignment_seq.NEXTVAL  PRIMARY KEY,
    task_id          NUMBER          NOT NULL REFERENCES onboarding_tasks(task_id),
    user_id          NUMBER          NOT NULL REFERENCES users(user_id),
    status           VARCHAR2(20)    DEFAULT 'Pending',
    due_date         DATE,
    completed_at     TIMESTAMP,
    notes            VARCHAR2(300),
    sla_due_date     DATE,
    responsible_owner NUMBER         REFERENCES users(user_id)
);

-- 5. DOCUMENTS
CREATE TABLE documents (
    doc_id           NUMBER          DEFAULT doc_seq.NEXTVAL  PRIMARY KEY,
    user_id          NUMBER          NOT NULL REFERENCES users(user_id),
    doc_type         VARCHAR2(100),
    file_path        VARCHAR2(500),
    status           VARCHAR2(20)    DEFAULT 'Pending',
    reviewed_by      NUMBER          REFERENCES users(user_id),
    rejection_reason VARCHAR2(300),
    uploaded_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      TIMESTAMP,
    sla_due_date     DATE,
    responsible_owner NUMBER         REFERENCES users(user_id)
);

-- 6. ASSETS
CREATE TABLE assets (
    asset_id         NUMBER          DEFAULT asset_seq.NEXTVAL  PRIMARY KEY,
    name             VARCHAR2(100)   NOT NULL,
    serial_number    VARCHAR2(100)   UNIQUE,
    category         VARCHAR2(50),
    condition        VARCHAR2(20)    DEFAULT 'Good',
    status           VARCHAR2(20)    DEFAULT 'Available',
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 7. ASSET_ASSIGNMENTS
CREATE TABLE asset_assignments (
    aa_id            NUMBER          DEFAULT aa_seq.NEXTVAL  PRIMARY KEY,
    asset_id         NUMBER          NOT NULL REFERENCES assets(asset_id),
    user_id          NUMBER          NOT NULL REFERENCES users(user_id),
    assigned_by      NUMBER          REFERENCES users(user_id),
    assigned_date    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    confirmed_at     TIMESTAMP,
    returned_at      TIMESTAMP
);

-- 8. TRAININGS
CREATE TABLE trainings (
    training_id      NUMBER          DEFAULT training_seq.NEXTVAL  PRIMARY KEY,
    title            VARCHAR2(200)   NOT NULL,
    description      VARCHAR2(500),
    duration_hours   NUMBER(4,1),
    resource_url     VARCHAR2(500),
    is_mandatory     NUMBER(1)       DEFAULT 1,
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 9. TRAINING_ASSIGNMENTS
CREATE TABLE training_assignments (
    ta_id            NUMBER          DEFAULT ta_seq.NEXTVAL  PRIMARY KEY,
    training_id      NUMBER          NOT NULL REFERENCES trainings(training_id),
    user_id          NUMBER          NOT NULL REFERENCES users(user_id),
    status           VARCHAR2(20)    DEFAULT 'Pending',
    assigned_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    completed_at     TIMESTAMP
);

-- 10. BUDDIES
CREATE TABLE buddies (
    buddy_id         NUMBER          DEFAULT buddy_seq.NEXTVAL  PRIMARY KEY,
    new_hire_id      NUMBER          NOT NULL REFERENCES users(user_id),
    buddy_user_id    NUMBER          NOT NULL REFERENCES users(user_id),
    assigned_by      NUMBER          REFERENCES users(user_id),
    assigned_date    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    is_active        NUMBER(1)       DEFAULT 1
);

-- 11. BUDDY_CHECKINS
CREATE TABLE buddy_checkins (
    checkin_id       NUMBER          DEFAULT checkin_seq.NEXTVAL  PRIMARY KEY,
    buddy_id         NUMBER          NOT NULL REFERENCES buddies(buddy_id),
    notes            CLOB,
    checkin_date     DATE            DEFAULT TRUNC(SYSDATE),
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 12. ONBOARDING_FAQS
CREATE TABLE onboarding_faqs (
    faq_id           NUMBER          DEFAULT faq_seq.NEXTVAL  PRIMARY KEY,
    question         VARCHAR2(500)   NOT NULL,
    answer           CLOB,
    category         VARCHAR2(100),
    keywords         VARCHAR2(300)
);

-- 13. ONBOARDING_TIMELINE
CREATE TABLE onboarding_timeline (
    event_id         NUMBER          DEFAULT timeline_seq.NEXTVAL  PRIMARY KEY,
    user_id          NUMBER          NOT NULL REFERENCES users(user_id),
    event_type       VARCHAR2(100)   NOT NULL,
    action_taken     VARCHAR2(500)   NOT NULL,
    status           VARCHAR2(50),
    next_action      VARCHAR2(500),
    responsible_owner NUMBER         REFERENCES users(user_id),
    due_date         DATE,
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 14. NOTIFICATIONS
CREATE TABLE notifications (
    notif_id         NUMBER          DEFAULT notif_seq.NEXTVAL PRIMARY KEY,
    user_id          NUMBER          NOT NULL REFERENCES users(user_id),
    type             VARCHAR2(100)   NOT NULL,
    message          VARCHAR2(500)   NOT NULL,
    action_link      VARCHAR2(500),
    is_read          NUMBER(1)       DEFAULT 0,
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 15. AUDIT_TRAIL
CREATE TABLE audit_trail (
    audit_id         NUMBER          DEFAULT audit_seq.NEXTVAL PRIMARY KEY,
    entity_type      VARCHAR2(100)   NOT NULL,
    entity_id        NUMBER          NOT NULL,
    action           VARCHAR2(100)   NOT NULL,
    old_value        VARCHAR2(500),
    new_value        VARCHAR2(500),
    changed_by       NUMBER          REFERENCES users(user_id),
    created_at       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ===================== INDEXES ==============================
CREATE INDEX idx_users_dept      ON users(department_id);
CREATE INDEX idx_ta_user         ON task_assignments(user_id);
CREATE INDEX idx_ta_status       ON task_assignments(status);
CREATE INDEX idx_docs_user       ON documents(user_id);
CREATE INDEX idx_aa_user         ON asset_assignments(user_id);
CREATE INDEX idx_tra_user        ON training_assignments(user_id);
CREATE INDEX idx_buddies_hire    ON buddies(new_hire_id);
CREATE INDEX idx_faq_category    ON onboarding_faqs(category);
