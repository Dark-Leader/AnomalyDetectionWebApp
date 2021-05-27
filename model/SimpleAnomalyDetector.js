const { AnomalyReport } = require('./AnomalyDetector.js');
const { pearson, linear_reg, Point, dev1, distance } = require('./anomaly_detection_util.js');
const {TimeSeries} = require('./timeseries.js');
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

    findThreshold(points, line) {
        let max = 0;
        let size = points.length;
        for (let i = 0; i < size; i++) {
            let d = Math.abs(points[i].y - line.f(points[i].x));
            if (d > max) {
                max = d;
            }
        }
        return max;
    }

    learnHelper(max_correlation, f1, f2, points, mode) {
        if(max_correlation > this.threshold){
            let c = new correlatedFeatures();
            c.feature1=f1;
            c.feature2=f2;
            c.correlation=max_correlation;
            c.lin_reg=linear_reg(points);
            c.threshold=this.findThreshold(points ,c.lin_reg)*1.1; // 10% increase
            this.cf.push(c);
        }
        else if (max_correlation > 0.5 && max_correlation < this.threshold && mode) {
            let c = new correlatedFeatures();
            let cl = enclosingCircle(points);
            c.feature1=f1;
            c.feature2=f2;
            c.correlation=max_correlation;
            c.threshold=cl.r*1.1; // 10% increase
            c.x=cl.x;
            c.y=cl.y;
            this.cf.push(c);
        }    
    }

    learnNormal (ts, mode) {
        let atts = ts.getAttributes();
        let size = atts.length;
        let vals = [];
        for (let i = 0; i < atts.length; i++) {
            let x = ts.getAttData(atts[i]);
            vals.push([]);
            for (let j = 0; j < size; j++) {
                vals[i].push(x[j]);
            }
        }
        let found_before = [];
        for (let i = 0; i < size; i++) {
            let f1 = atts[i];
            for (let c of this.cf) {
                let first = c.feature1;
                let second = c.feature2;
                if (found_before.indexOf(first) == -1) {
                    found_before.push(first);
                }
                if (found_before.indexOf(second) == -1) {
                    found_before.push(second);
                }
            }
            if (found_before.indexOf(f1) > -1) {
                continue;
            }
            let max_correlation = 0;
            let jmax = 0;
            for (let j = i+1; j < size; j++) {
                let fj = atts[j];
                if (found_before.indexOf(fj) > -1) {
                    continue;
                }
                let correlation = Math.abs(pearson(vals[i], vals[j]));
                    if (correlation > max_correlation) {
                        max_correlation = correlation;
                        jmax = j;
                    }
            }
            let points = [];
            let f2 = atts[jmax];
            for (let i = 0; i < ts.getRowSize(); i++) {
                points.push(new Point(ts.getAttData(f1)[i], ts.getAttData(f2)[i]));
            }
            this.learnHelper(max_correlation, f1, f2, points, mode);
        }
    }

    regularAnomalus(x, y, c) {
        return (Math.abs(y - c.lin_reg.f(x)) > c.threshold);
    }

    multiIsAnomalous(x, y, c, mode) {
        return (c.correlation >= this.threshold && this.regularAnomalus(x,y,c)) || (mode && c.correlation > 0.5 && c.correlation < 0.9 && distance(new Point(c.x, c.y), new Point(x,y)) > c.threshold);
    }

    detect(ts, mode) {
        let anomalys = [];
        if (this.cf.length == 0) {
            return anomalys;
        }
        for (let correlated of this.cf) {
            let x = ts.getAttData(correlated.feature1);
            let y = ts.getAttData(correlated.feature2);
            for (let i = 0; i < x.length; i++) {
                if (this.multiIsAnomalous(x[i], y[i], correlated, mode)) {
                    anomalys.push(new AnomalyReport(correlated.feature1 + "-" + correlated.feature2, i+1));
                }
            }
        }
        return anomalys;
    }
}

module.exports = {
    SimpleAnomalyDetector, correlatedFeatures
}


/*
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
*/
