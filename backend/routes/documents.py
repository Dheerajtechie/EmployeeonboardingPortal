from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import db
import config
from services.auth_service import get_current_user, require_role
from models.document import DocumentReject
import os
import uuid
from datetime import datetime

router = APIRouter(prefix="/documents", tags=["documents"])

@router.get("/my")
def get_my_documents(conn = Depends(db.get_db), current_user: dict = Depends(require_role(["new_hire"]))):
    cursor = conn.cursor()
    cursor.execute(
        "SELECT doc_id, user_id, doc_type, file_path, status, reviewed_by, rejection_reason, uploaded_at, reviewed_at, expiration_date "
        "FROM DOCUMENTS WHERE user_id = :1", [current_user["user_id"]]
    )
    
    docs = []
    for row in cursor.fetchall():
        docs.append({
            "doc_id": row[0],
            "user_id": row[1],
            "doc_type": row[2],
            "file_path": row[3],
            "status": row[4],
            "reviewed_by": row[5],
            "rejection_reason": row[6],
            "uploaded_at": row[7],
            "reviewed_at": row[8],
            "expiration_date": row[9]
        })
    return docs

@router.post("/upload")
async def upload_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    conn = Depends(db.get_db),
    current_user: dict = Depends(require_role(["new_hire"]))
):
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(config.FILE_UPLOAD_PATH, filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    cursor = conn.cursor()
    # Check if doc_type already exists
    cursor.execute("SELECT doc_id FROM DOCUMENTS WHERE user_id = :1 AND doc_type = :2", [current_user["user_id"], doc_type])
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(
            "UPDATE DOCUMENTS SET file_path = :1, status = 'Under Review', uploaded_at = CURRENT_TIMESTAMP, rejection_reason = NULL, updated_by = :2 WHERE doc_id = :3",
            [filename, current_user["user_id"], existing[0]]
        )
    else:
        cursor.execute(
            "INSERT INTO DOCUMENTS (user_id, doc_type, file_path, status, created_by) VALUES (:1, :2, :3, 'Under Review', :4)",
            [current_user["user_id"], doc_type, filename, current_user["user_id"]]
        )
        
    # Auto-complete associated tasks
    if doc_type in ['Aadhaar Card', 'PAN Card']:
        cursor.execute("UPDATE TASK_ASSIGNMENTS SET status = 'Completed' WHERE user_id = :1 AND task_id = 1", [current_user["user_id"]])
        
    conn.commit()
    return {"message": "Document uploaded successfully", "file_path": filename}

@router.put("/{id}/verify")
def verify_document(id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE DOCUMENTS SET status = 'Approved', reviewed_by = :1, reviewed_at = CURRENT_TIMESTAMP, updated_by = :1 WHERE doc_id = :2",
        [current_user["user_id"], id]
    )
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    conn.commit()
    return {"message": "Document verified"}

@router.put("/{id}/reject")
def reject_document(id: int, data: DocumentReject, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE DOCUMENTS SET status = 'Rejected', reviewed_by = :1, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = :2, updated_by = :1 WHERE doc_id = :3",
        [current_user["user_id"], data.reason, id]
    )
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Trigger Re-upload notification
    cursor.execute("SELECT user_id, doc_type FROM DOCUMENTS WHERE doc_id = :1", [id])
    doc_user, doc_type = cursor.fetchone()
    cursor.execute(
        "INSERT INTO NOTIFICATIONS (user_id, type, message, action_link, metadata) VALUES (:1, 'Document Rejected', :2, '/documents', :3)",
        [doc_user, f"Your {doc_type} was rejected: {data.reason}", f'{{"doc_id": {id}}}']
    )

    conn.commit()
    return {"message": "Document rejected and user notified"}
