# Anomaly-WebAPP
** Anomaly-Web App **

Creators: Lola Sirota, Noam Salomon, Sam Katz, Amit Ben Shimon

**Main Project Features:**
1.	Two different algorithms for anomaly detection.
2.	Display data regarding anomaly detections using browser or any programming language. The user is able to choose freely between both algorithms(Hybrid, Linear).
3.	Python code which can connect directly to the server,and in turn present a json file which contains the anomaly detections.


**Project Structure:**
- All view related object are inside the View Folder.
- All viewModel related objects are inside the viewModel Folder.
- All Model related objects are inside the Model Folder.


**Requirements:**
- Any framework which is able to run javascript for example vs code.
- Node js version: 14.17.0 LTS(lower version might also be compatible)
- python version 3 
- express  library
- express file upload library


**How To Use:**
There two different ways to connect:
1.	Connect your local browser(preferably chrome, though is not necessary).
Type: http://localhost:8080/ ,  after which you choose between two algorithms(hybrid and anomaly). Following that user chooses train and test file respectively.
And then click submit, and the result would be shown on the screen.
2.	Connect via any programming language. We have created an example via python, namely you can get a Json file which contains the anomaly detections(given that you enter two files, and a string which would represent the type of algorithm that you want).                                                                          The line to execute the code: py  req.py.                                                                                               certainly you can use other languages as well, the above-mentioned  is a pure example.


**For More Information:**
Please watch our short premiere for our app at Youtube :
