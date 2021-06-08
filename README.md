# Anomaly-WebAPP
**Anomaly-Web App**

Creators: Lola Sirota, Noam Salomon, Sam Katz, Amit Ben Shimon

**Main Project Features:**
1.	Two different algorithms for anomaly detection.
2.	Display data regarding anomaly detections using browser or any programming language. The user is able to choose freely between both algorithms(Hybrid, Linear Regression).
3.	Python code which can connect directly to the server,and in turn present a json file which contains the anomaly detections.


**Project Structure:**
- All view related object are inside the view Folder.
- All controller related objects are inside the controller Folder.
- All Model related objects are inside the model Folder.


**Requirements:**
- Any framework which is able to run javascript for example vs code.
- Node js version: 14.17.0 LTS(lower version might also be compatible)
- python version 3 (for the example req.py file provided inside the model folder) - in addition the requests module in python
- express library
- express file upload library
- smallest-enclosing-circle library


**How To Use:**

There are two different ways to connect:

1. Open the project, add the necessary requirements, navigate to the controller folder after which you run the server with command:

node expServer.js

then, Connect to your local browser(preferably chrome, though is not necessary).
Type: http://localhost:8080/ ,  after which you choose between two algorithms(hybrid and anomaly). Following that the user chooses train and test file respectively.
And then click submit, and the result will be shown on the screen.

2. Connect via any programming language. We have created an example via python, namely you can get a Json file which contains the anomaly detections
(given that you enter two files, and a string which would represent the type of algorithm that you want).
navigate to the model folder (while the server is still running in the background) and write the following command in the terminal to run the script:

py req.py

certainly you can use other languages as well, the above-mentioned is a pure example.


**For More Information:**

Please watch our short premiere for our app at Youtube : https://youtu.be/9eEkGEUp80I


in addition, we provide you with 2 example csv files inside the model folder - one file is a train file, the other is to check for anomalies on.
all csv files provided must contain titles for all columns, and there must not be any duplicates in said titles.

