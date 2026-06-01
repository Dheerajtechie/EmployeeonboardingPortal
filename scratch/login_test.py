import http.client, json, traceback

try:
	conn = http.client.HTTPConnection('127.0.0.1',8000, timeout=10)
	payload = json.dumps({'email':'hr_admin@company.com','password':'admin123'})
	headers = {'Content-Type':'application/json'}
	conn.request('POST','/auth/login',payload,headers)
	res = conn.getresponse()
	print('STATUS:', res.status, res.reason)
	data = res.read().decode()
	print('BODY:', data)
except Exception as e:
	print('EXCEPTION:')
	traceback.print_exc()
finally:
	try:
		conn.close()
	except:
		pass