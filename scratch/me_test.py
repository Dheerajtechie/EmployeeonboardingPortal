import httpx

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiaHJfYWRtaW4iLCJleHAiOjE3ODAxNDczMjV9.uJLzayBgPxduabWyDUVj3ZrtUYEXK4qI06AVYBCi4To'
try:
    with httpx.Client(timeout=10) as client:
        resp = client.get('http://127.0.0.1:8000/auth/me', headers={'Authorization': f'Bearer {token}'})
        print('STATUS:', resp.status_code)
        print(resp.text)
except Exception as e:
    print('EXCEPTION:')
    import traceback
    traceback.print_exc()