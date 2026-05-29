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
        "SELECT doc_id, user_id, doc_type, file_path, status, reviewed_by, rejection_reason, uploaded_at, reviewed_at "
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
            "reviewed_at": row[8]
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
            "UPDATE DOCUMENTS SET file_path = :1, status = 'Pending', uploaded_at = CURRENT_TIMESTAMP, rejection_reason = NULL WHERE doc_id = :2",
            [filename, existing[0]]
        )
    else:
        cursor.execute(
            "INSERT INTO DOCUMENTS (user_id, doc_type, file_path, status) VALUES (:1, :2, :3, 'Pending')",
            [current_user["user_id"], doc_type, filename]
        )
        
    conn.commit()
    return {"message": "Document uploaded successfully", "file_path": filename}

@router.put("/{id}/verify")
def verify_document(id: int, conn = Depends(db.get_db), current_user: dict = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE DOCUMENTS SET status = 'Verified', reviewed_by = :1, reviewed_at = CURRENT_TIMESTAMP WHERE doc_id = :2",
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
        "UPDATE DOCUMENTS SET status = 'Rejected', reviewed_by = :1, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = :2 WHERE doc_id = :3",
        [current_user["user_id"], data.reason, id]
    )
    
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Document not found")
        
    conn.commit()
    return {"message": "Document rejected"}
