import requests

url = 'http://localhost:5000/chatbot/ask'
payload = {
    'query': 'What documents do I need on Day 1, and what are my pending tasks?',
    'user_id': 4
}
try:
    response = requests.post(url, json=payload)
    print('Status Code:', response.status_code)
    print('Response:', response.json())
except Exception as e:
    print('Error:', e)
