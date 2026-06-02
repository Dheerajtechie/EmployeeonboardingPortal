# Database Schema Reference

The portal relies on Oracle Express Edition (XE) with the following relational schema.

## Entity Relationship Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "contains"
    USERS ||--o{ TASK_ASSIGNMENTS : "assigned"
    USERS ||--o{ DOCUMENTS : "uploads"
    USERS ||--o{ TRAINING_ASSIGNMENTS : "takes"
    USERS ||--o{ ASSET_ASSIGNMENTS : "receives"
    USERS ||--o{ BUDDIES : "is assigned buddy"
    
    ONBOARDING_TASKS ||--o{ TASK_ASSIGNMENTS : "defines"
    ASSETS ||--o{ ASSET_ASSIGNMENTS : "allocates"
    TRAININGS ||--o{ TRAINING_ASSIGNMENTS : "defines"

    USERS {
        NUMBER user_id PK
        VARCHAR2 name
        VARCHAR2 email
        VARCHAR2 password_hash
        VARCHAR2 role "new_hire, hr_admin, it_admin, buddy"
        NUMBER department_id FK
        VARCHAR2 status
    }
    
    DEPARTMENTS {
        NUMBER department_id PK
        VARCHAR2 name
    }
    
    DOCUMENTS {
        NUMBER doc_id PK
        NUMBER user_id FK
        VARCHAR2 doc_type
        VARCHAR2 status "Pending, Approved, Rejected"
        VARCHAR2 rejection_reason
    }
    
    ASSETS {
        NUMBER asset_id PK
        VARCHAR2 name
        VARCHAR2 serial_number
        VARCHAR2 condition
        VARCHAR2 status "Available, Assigned, Needs Repair"
    }

    ONBOARDING_FAQS {
        NUMBER faq_id PK
        VARCHAR2 question
        CLOB answer
        VARCHAR2 keywords
    }
```

## Audit Integrity
All assignment tables (`TASK_ASSIGNMENTS`, `DOCUMENTS`, `ASSET_ASSIGNMENTS`) record timestamps for creations and modifications. 
The database incorporates `ON DELETE CASCADE` triggers inherently managed by API logic to ensure data remains orphaned-free if a user or department is deleted.
