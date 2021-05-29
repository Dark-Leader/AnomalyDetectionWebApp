url = 'http://localhost:8080'

import requests

files = {'normal_file': open("train.csv",'rb'),
         'anomaly_file': open("test.csv",'rb')}

payload = {'algorithm_type': 'Hybrid Algorithm'}
s = requests.Session()
r = s.post(url,data=payload,files=files)
print(r.text)