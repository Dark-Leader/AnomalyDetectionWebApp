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

//anomalies array of json objs. returned to client after client's post
const anomalies = [];


const app = express()
app.use(express.urlencoded({
    extended: false
}))


app.use(fileUpload())

app.use(express.static('../view'))

/* GET */

app.get("/", (req, res) => {
    res.sendFile("./index.html")
})

/* POST */

function detect(req, res) {
    let reports = null;
    let type_algo = req.body.algorithm_type;
    let invalid_input = "Invalid input.\nPlease choose an algorithm type, normal csv file and test csv file.\n";
    if (req.files) {
        var file = req.files.normal_file;
        if (file == null) {
            res.write(invalid_input);
            res.end();
            return;
        }
        var result = file.data.toString();
        fs.writeFileSync('../model/train.csv', result, function (err) { // created train.csv
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
        fs.writeFileSync('../model/test.csv', result2, function (err) { // created test.csv
            if (err) {
                return console.error(err);
            }
        });
        let detector = new SimpleAnomalyDetector(); // created detector
        try{
            let ts1 = new TimeSeries("../model/train.csv");
            let ts2 = new TimeSeries("../model/test.csv");
            let mode = false;
            if (type_algo == "Hybrid Algorithm") {
                mode = true;
            } else if (type_algo == "Regression Algorithm") {
                mode = false;
            } else {
                res.write(invalid_input);
                res.end();
                return;
            }
            detector.learnNormal(ts1, mode);
            reports = detector.detect(ts2, mode);
        } catch (e) {
            res.write(invalid_input);
            res.end();
            return;
        }
    }
    return reports;
}
app.post("/detectUI", (req,res) =>{
    const reports = detect(req,res);
    if(reports){
        let anomalies = [];
        var temp = JSON.parse(reports);

        var keys = Object.keys(temp);
        anomalies.push('The following anomalies were found: </br>');
        for (var i = 0; i < keys.length; i++) {
            anomalies.push('In feautures: ' + keys[i] + ', at timesteps: ' + temp[keys[i]] + '</br>');
        }
        res.status(200).send(anomalies.join(''));
        res.end();
    }
})

app.post("/detect", (req, res) => {
    const reports = detect(req,res);
    if(reports){
        res.write(reports);
        res.end();
    }
})

app.post("/", (req, res) => {
    res.redirect(307, '/detect');
    res.end();
})



app.listen(8080)















