url = 'http://localhost:8080'

import requests

path_to_train_csv_file = "train.csv"
path_to_test_csv_file = "test.csv"
algo_setting = 'Hybrid Algorithm' # or 'Regression Algorithm'
files = {'normal_file': open(path_to_train_csv_file,'rb'),
         'anomaly_file': open(path_to_test_csv_file,'rb')} # read train and anomaly files.

payload = {'algorithm_type': algo_setting}
s = requests.Session()
r = s.post(url,data=payload,files=files) # send request to server.
print(r.text) # print the response from the server.