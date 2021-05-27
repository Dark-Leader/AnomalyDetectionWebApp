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

app.post("/detect", (req, res) => {
    res.write('searching for ' + req.body.algorithm_type + ':\n')
    var type_algo = req.body.algorithm_type
    if (req.files) {
        var file = req.files.normal_file;
        var result = file.data.toString();
        fs.writeFileSync('../model/train.csv', result, function (err) { // created train.csv
            if (err) {
                return console.error(err);
            }
        });
        var file2 = req.files.anomaly_file
        var result2 = file2.data.toString()
        fs.writeFileSync('../model/test.csv', result2, function (err) { // created test.csv
            if (err) {
                return console.error(err);
            }
        });
        let detector = new SimpleAnomalyDetector(); // created detector
        let ts1 = new TimeSeries("../model/train.csv");
        let ts2 = new TimeSeries("../model/test.csv");
        let mode = false;
        if (type_algo == "Hybrid Algorithm") {
            mode = true;
        }
        detector.learnNormal(ts1, mode);
        let reports = detector.detect(ts2, mode);
        for (let report of reports) {
            res.write(report.desc + '\t' + report.time + "\n");
        }
    }
    res.end()

})


app.post("/", (req, res) => {
    //res.write('searching for ' + req.body.algorithm_type + ':\n')
    var type_algo = req.body.algorithm_type
    if (req.files) {
        var file = req.files.normal_file;
        var result = file.data.toString();
        fs.writeFileSync('../model/train.csv', result, function (err) { // created train.csv locally
            if (err) {
                return console.error(err);
            }
        });
        var file2 = req.files.anomaly_file
        var result2 = file2.data.toString()
        fs.writeFileSync('../model/test.csv', result2, function (err) { // created test.csv locally
            if (err) {
                return console.error(err);
            }
        });
        let detector = new SimpleAnomalyDetector(); // created detector
        let ts1 = new TimeSeries("../model/train.csv");
        let ts2 = new TimeSeries("../model/test.csv");
        let mode = false;
        if (type_algo == "Hybrid Algorithm") {
            mode = true;
        }
        detector.learnNormal(ts1, mode);
        let reports = detector.detect(ts2, mode);
        for (let report of reports) {
            //noam:
            const anomaly = {
                desc: report.desc, time: report.time,
            };
            anomalies.push(anomaly);
            //noam~
        }
        //noam:

        //res.send(JSON.stringify(anomalies));
        res.send(anomalies);
        //res.json(JSON.stringify(anomalies));
        //res.write(JSON.stringify(anomalies));
        //noam~
    }
    res.end();

})



app.listen(8080)















