const { AnomalyReport } = require('./AnomalyDetector.js');
const { pearson, linear_reg, Point, dev1, distance } = require('./anomaly_detection_util.js');
const {TimeSeries} = require('./timeseries.js');
//const {findMinCircle, distance} = require('./minCircle');
const enclosingCircle = require('smallest-enclosing-circle')

class correlatedFeatures {
    constructor() {
        this.feature1 = null;
        this.feature2 = null;
        this.lin_reg = null;
        this.threshold = null;
        this.correlation = null;
        this.x = null;
        this.y = null;
        this.radius = null;
    }
}

class SimpleAnomalyDetector {
    constructor() {
        this.cf = [];
        this.variables = [];
        this.threshold = 0.9;
    }

    learnNormal (ts, mode) {
        let atts = ts.getAttributes();
        let copy = atts.slice();
        let size = atts.length;
        let vals = [];
        for (let i = 0; i < atts.length; i++) {
            let x = ts.getAttData(atts[i]);
            vals.push([]);
            for (let j = 0; j < size; j++) {
                vals[i].push(x[j]);
            }
        }
        let before = [];
        for (let c of this.cf) {
            before.push(c.feature1);
            before.push(c.feature2);
        }
        for (let i = 0; i < size; i++) {
            let f1 = atts[i];
            if (before.indexOf(f1) > -1) {
                continue;
            }
            if (copy.indexOf(f1) == -1) {
                continue;
            }
            let max_correlation = 0;
            let jmax = 0;
            for (let j = i+1; j < size; j++) {
                let correlation = Math.abs(pearson(vals[i], vals[j]));
                    if (correlation > max_correlation) {
                        max_correlation = correlation;
                        jmax = j;
                    }
            }
            if (max_correlation < 0.5) {
                continue;
            }
            let f2 = atts[jmax];
            if (before.indexOf(f2) > -1) {
                continue;
            }
            if (copy.indexOf(f2) == -1) {
                continue;
            }
            let points = [];
            for (let i = 0; i < ts.getRowSize(); i++) {
                points.push(new Point(ts.getAttData(f1)[i], ts.getAttData(f2)[i]));
            }
            let correlated = new correlatedFeatures();
            if (mode) {
                //let c = findMinCircle(points);
                let c = enclosingCircle(points);
                correlated.threshold = c.r;
                correlated.x = c.x;
                correlated.y = c.y;
                correlated.radius = c.r;
            } else if (max_correlation >= 0.9) {
                let line = linear_reg(points);
                let max_dev = 0;
                for (let i = 0; i < ts.getRowSize(); i++) {
                    let deviation = dev1(new Point(ts.getAttData(f1)[i], ts.getAttData(f2)[i]),line);
                    if (deviation > max_dev) {
                        max_dev = deviation;
                    }
                }
                correlated.threshold = max_dev;
                correlated.lin_reg = line;
            } else if (!mode && max_correlation < 0.9) {
                continue;
            }
            correlated.feature1 = f1;
            correlated.feature2 = f2;
            correlated.correlation = max_correlation;
            this.cf.push(correlated);
            let idx1 = copy.indexOf(f1);
            copy.splice(idx1, 1);
            let idx2 = copy.indexOf(f2);
            copy.splice(idx2, 1);
        }
        if (mode) {
            this.learnNormal(ts, !mode);
        }
    }

    detect(ts, mode) {
        let data = ts.getData();
        let anomalys = [];
        if (this.cf.length == 0) {
            return anomalys;
        }
        for (let correlated of this.cf) {
            let maxDev = correlated.threshold * 1.1;
            let first = data[correlated.feature1];
            let second = data[correlated.feature2];
            for (let i = 0; i < ts.getRowSize(); i++) {
                let point = new Point(first[i], second[i]);
                if (mode) {
                    let center = new Point(correlated.x,correlated.y);
                    let dis = distance(center, point);
                    if (dis > maxDev) {
                        anomalys.push(new AnomalyReport(correlated.feature1 + "-" + correlated.feature2, i+1));
                    }
                } else {
                    let deviation = dev1(point, correlated.lin_reg);
                    if (deviation > maxDev) {
                        anomalys.push(new AnomalyReport(correlated.feature1 + "-" + correlated.feature2, i+1));
                    }
                }
            }
        }
        return anomalys;
    }
}

module.exports = {
    SimpleAnomalyDetector, correlatedFeatures
}



let ts = new TimeSeries('train.csv');
let ts2 = new TimeSeries('test.csv');
let ad = new SimpleAnomalyDetector();
let hybrid = true;
ad.learnNormal(ts, hybrid);
console.log("Correlated Features:");
for (let c of ad.cf) {
    console.log(c.feature1 + "-" + c.feature2);
}
let res = ad.detect(ts2, hybrid);
console.log();
console.log("anomalys Features:");
for (r of res) {
    console.log(r.desc + '\t' + r.time);
}


/*
correct results:
    for hybrid = false:

    Correlated Features:
    A-B
    C-D

    anomalys Features:
    A-B     73
    A-B     74
    A-B     75
    A-B     76
    C-D     133
    C-D     134
    C-D     135

    for hybrid = true:
    
    Correlated Features:
    A-B
    C-D
    E-F

    anomalys Features:
    E-F     8
    E-F     9
    E-F     10
    E-F     11

*/

