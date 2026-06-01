import requests

# 1. Login as HR
login_res = requests.post("http://localhost:8001/auth/login", json={
    "email": "hr_admin@company.com",
    "password": "admin123"
})
print("Login status:", login_res.status_code)
token = login_res.json().get("access_token")

# 2. Register
res = requests.post("http://localhost:8001/auth/register", json={
    "name": "Test User",
    "email": "test2@company.com",
    "role": "new_hire",
    "department_id": 1,
    "joining_date": "2026-06-01T10:00:00"
}, headers={"Authorization": f"Bearer {token}"})

print("Register status:", res.status_code)
print("Register response:", res.text)
