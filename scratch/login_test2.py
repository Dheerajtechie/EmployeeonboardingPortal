import httpx

try:
    with httpx.Client(timeout=10) as client:
        resp = client.post('http://127.0.0.1:8000/auth/login', json={'email':'hr_admin@company.com','password':'admin123'})
        print('STATUS:', resp.status_code)
        print(resp.text)
except Exception as e:
    print('EXCEPTION:')
    import traceback
    traceback.print_exc()