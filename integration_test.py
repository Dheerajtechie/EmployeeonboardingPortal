import requests
import json
import uuid

BASE_URL = "http://localhost:8000"
AI_URL = "http://localhost:5000"

def print_step(title, res):
    print(f"\n{'='*50}\n[STEP] {title}\n{'='*50}")
    print(f"Status Code: {res.status_code}")
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)

print("Starting End-to-End Test for Onboarding Portal...")

# 1. HR Login
res = requests.post(f"{BASE_URL}/auth/login", json={"email": "hr_admin@company.com", "password": "admin123"})
print_step("HR Login", res)
hr_token = res.json().get("access_token")
hr_headers = {"Authorization": f"Bearer {hr_token}"}

# 2. HR registers new hire
new_hire_email = f"newhire_{uuid.uuid4().hex[:6]}@company.com"
payload = {
    "name": "Test New Hire",
    "email": new_hire_email,
    "role": "new_hire",
    "department_id": 1,
    "joining_date": "2026-06-01"
}
res = requests.post(f"{BASE_URL}/auth/register", json=payload, headers=hr_headers)
print_step("HR Registers New Hire", res)
nh_data = res.json()
nh_id = nh_data.get("user_id")
temp_pass = nh_data.get("temp_password")

# 3. New Hire Login
res = requests.post(f"{BASE_URL}/auth/login", json={"email": new_hire_email, "password": temp_pass})
print_step("New Hire Initial Login", res)
nh_token = res.json().get("access_token")
nh_headers = {"Authorization": f"Bearer {nh_token}"}

# 4. New Hire gets checklist
res = requests.get(f"{BASE_URL}/tasks/my", headers=nh_headers)
print_step("New Hire Checklist (Auto-assigned tasks)", res)
tasks = res.json()
if tasks:
    task_id = tasks[0]["assignment_id"]
    # 5. New Hire completes a task
    res = requests.put(f"{BASE_URL}/tasks/{task_id}/complete", headers=nh_headers)
    print_step("New Hire Completes Task", res)

# 6. Chatbot RAG query
res = requests.post(f"{AI_URL}/chatbot/ask", json={"query": "What should I do on my first day?", "user_id": nh_id})
print_step("AI Chatbot RAG Query (Pending Tasks Injected)", res)

# 7. HR Dashboard Stats
res = requests.get(f"{BASE_URL}/admin/dashboard-stats", headers=hr_headers)
print_step("HR Dashboard KPIs", res)

print("\nEnd-to-End Test Completed Successfully.")
