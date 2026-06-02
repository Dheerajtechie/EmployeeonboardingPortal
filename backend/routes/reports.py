from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import db
from services.auth_service import get_current_user, require_role
import io
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/excel")
def export_excel_report(current_user=Depends(require_role(["hr_admin"]))):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT u.name, u.email, d.name, u.joining_date "
            "FROM USERS u LEFT JOIN DEPARTMENTS d ON u.department_id = d.department_id "
            "WHERE u.role='new_hire'"
        )
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Onboarding Report"
        ws.append(["Name", "Email", "Department", "Joining Date"])
        
        for row in cursor.fetchall():
            ws.append([row[0], row[1], row[2], row[3].strftime("%Y-%m-%d") if row[3] else ""])
            
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        headers = {
            'Content-Disposition': 'attachment; filename="onboarding_report.xlsx"'
        }
        return StreamingResponse(output, headers=headers, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    finally:
        db.release_connection(conn)

@router.get("/pdf")
def export_pdf_report(current_user=Depends(require_role(["hr_admin"]))):
    conn = db.get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT u.name, u.email, d.name, u.joining_date "
            "FROM USERS u LEFT JOIN DEPARTMENTS d ON u.department_id = d.department_id "
            "WHERE u.role='new_hire'"
        )
        
        output = io.BytesIO()
        p = canvas.Canvas(output, pagesize=letter)
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 750, "Wipro Enterprise Onboarding Report")
        
        p.setFont("Helvetica", 10)
        y = 700
        p.drawString(50, y, "Name | Email | Department | Joining Date")
        y -= 20
        p.line(50, y+10, 550, y+10)
        
        for row in cursor.fetchall():
            text = f"{row[0]} | {row[1]} | {row[2]} | {row[3].strftime('%Y-%m-%d') if row[3] else ''}"
            p.drawString(50, y, text)
            y -= 20
            if y < 50:
                p.showPage()
                p.setFont("Helvetica", 10)
                y = 750
                
        p.save()
        output.seek(0)
        
        headers = {
            'Content-Disposition': 'attachment; filename="onboarding_report.pdf"'
        }
        return StreamingResponse(output, headers=headers, media_type="application/pdf")
    finally:
        db.release_connection(conn)
