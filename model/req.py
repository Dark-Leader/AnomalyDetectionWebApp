url = 'http://localhost:8080'

import requests

files = {'normal_file': open("train.csv",'rb'),
         'anomaly_file': open("test.csv",'rb')} # read train and anomaly files.

payload = {'algorithm_type': 'Hybrid Algorithm'}
# payload = {'algorithm_type': 'Regression Algorithm'} # for linear regression mode.
s = requests.Session()
r = s.post(url,data=payload,files=files) # send request to server.
print(r.text) # print the response from the server.