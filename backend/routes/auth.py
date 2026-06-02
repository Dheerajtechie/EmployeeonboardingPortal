from fastapi import APIRouter, Depends, HTTPException, status
import db
from models.user import UserCreate, UserLogin, SetPassword, UserResponse, TokenData
from services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user, require_role
from services.task_service import auto_assign_tasks_and_trainings
from datetime import datetime
import oracledb
from services.auth_service import token_blacklist, oauth2_scheme

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    token_blacklist.add(token)
    return {"message": "Logged out successfully"}

@router.post("/login")
def login(user_data: UserLogin, conn = Depends(db.get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, password_hash, role FROM USERS WHERE email = :1", [user_data.email])
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    user_id, hashed_pwd, role = row
    if not verify_password(user_data.password, hashed_pwd):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"user_id": user_id, "role": role})
    return {"access_token": access_token, "token_type": "bearer", "role": role, "user_id": user_id}

@router.post("/register")
def register_new_hire(user: UserCreate, conn = Depends(db.get_db), current_user = Depends(require_role(["hr_admin"]))):
    cursor = conn.cursor()
    
    # Check if email exists
    cursor.execute("SELECT user_id FROM USERS WHERE email = :1", [user.email])
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="A user with this email is already registered.")
        
    # Create temp password
    temp_password = "temp123!"
    hashed_pwd = get_password_hash(temp_password)
    
    try:
        out_val = cursor.var(int)
        cursor.execute(
            "INSERT INTO USERS (name, email, password_hash, role, department_id, joining_date) VALUES (:1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD')) RETURNING user_id INTO :7",
            [user.name, user.email, hashed_pwd, user.role, user.department_id, user.joining_date.isoformat(), out_val]
        )
        
        user_id = out_val.getvalue()[0]
        
        # Auto-assign tasks and trainings
        auto_assign_tasks_and_trainings(conn, user_id, user.department_id, user.joining_date)
        
        conn.commit()
        return {"message": "User created successfully", "user_id": user_id, "temp_password": temp_password}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/set-password")
def set_password(req: SetPassword, conn = Depends(db.get_db)):
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM USERS WHERE user_id = :1", [req.user_id])
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed = get_password_hash(req.new_password)
    cursor.execute("UPDATE USERS SET password_hash = :1 WHERE user_id = :2", [hashed, req.user_id])
    conn.commit()
    return {"message": "Password updated successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "department_id": current_user["department_id"],
        "joining_date": current_user.get("joining_date"),
        "is_active": current_user.get("is_active", 1),
        "created_at": current_user.get("created_at")
    }
