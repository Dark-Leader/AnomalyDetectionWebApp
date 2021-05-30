const express = require('express')
const fileUpload = require('express-fileupload')
const model = require('../model/check.js')
const fs = require('fs')
const { TimeSeries } = require('../model/timeseries')
const { SimpleAnomalyDetector, correlatedFeatures } = require('../model/SimpleAnomalyDetector')
const { AnomalyReport } = require('../model/AnomalyDetector')

/**
 * API for sending an http POST req.:
 * algorithm type-
 * --KEY--: algorithm_type.
 * --VALUE--: Regression Algorithm / Hybrid Algorithm
 * 
 * train file-
 * --KEY--: normal_file
 * 
 * test file-
 * --KEY--: anomaly_file  
 */



const app = express() 
app.use(express.urlencoded({
    extended: false
}))


app.use(fileUpload())


//set root directory
app.use(express.static('../view')) 

/**
 * detect function. read reg. and ano. flights, and return the anonalies to user
 * @param {*} req - object that represent the client's request
 * @param {*} res - object that represent our response
 * @returns - anomalies report
 */
 function detect(req, res) {
    let reports = null;
    let type_algo = req.body.algorithm_type; 
    let invalid_input = "Invalid input.\nPlease choose an algorithm type, normal csv file and test csv file.\n";
    //check is files are existed
    if (req.files) {
        var file = req.files.normal_file;
        if (file == null) {
            res.write(invalid_input);
            res.end();
            return;
        }
        /*get files data and store it in local files*/
        var result = file.data.toString();
        fs.writeFileSync('../model/train.csv', result, function (err) { 
            if (err) {
                return console.error(err);
            }
        });
        let file2 = req.files.anomaly_file;
        if (file2 == null) {
            res.write(invalid_input);
            res.end();
            return;
        }
        let result2 = file2.data.toString()
        fs.writeFileSync('../model/test.csv', result2, function (err) {
            if (err) {
                return console.error(err);
            }
        });
        //create detector
        let detector = new SimpleAnomalyDetector(); // created detector
        try{
            let ts1 = new TimeSeries("../model/train.csv");
            let ts2 = new TimeSeries("../model/test.csv");
            let mode = false;
            //check validation
            if (type_algo == "Hybrid Algorithm") {
                mode = true;
            } else if (type_algo == "Regression Algorithm") {
                mode = false;
            } else {
                res.write(invalid_input);
                res.end();
                return;
            }
            //learn and detect
            detector.learnNormal(ts1, mode);
            reports = detector.detect(ts2, mode);
        } catch (e) {
            res.write(invalid_input);
            res.end();
            return;
        }
    }
    //return the user the anomalies report
    return reports;
}


/* GET */

app.get("/", (req, res) => {
    res.sendFile("./index.html")
})




/* POST */
/**
 * for handling the UI response
 */
app.post("/detectUI", (req,res) =>{
    //retreive anomalies report from files
    const reports = detect(req,res);
    if(reports){
        let anomalies = [];
        var temp = JSON.parse(reports); //hold an json object contains the results

        var keys = Object.keys(temp);
        anomalies.push('The following anomalies were found: </br>');
        //prepare the anomalies and send them to the client
        for (var i = 0; i < keys.length; i++) {
            anomalies.push('In feautures: ' + keys[i] + ', at timesteps: ' + temp[keys[i]] + '</br>');
        }
        res.status(200).send(anomalies.join(''));
        res.end();
    }
})

/**
 * for handling the POST response
 */
app.post("/detect", (req, res) => {
    const reports = detect(req,res); //retreive results
    if(reports){
        res.write(reports); //send them
        res.end();
    }
})

//redirect to the other post func.

app.post("/", (req, res) => {
    res.redirect(307, '/detect');
    res.end();
})


//listen on this port
app.listen(8080)















