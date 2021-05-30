const { AnomalyReport } = require('./AnomalyDetector.js');
const { pearson, linear_reg, Point, dev1, distance, Line } = require('./anomaly_detection_util.js');
const {TimeSeries} = require('./timeseries.js');
const enclosingCircle = require('smallest-enclosing-circle')


/**
 * Represests a pair of correlated features
 */
class correlatedFeatures {
    /**
     * constructor
     */
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
/**
 * Represents an anomaly detector, works in linear regression mode or hybrid mode (linear regression and min circle)
 */
class SimpleAnomalyDetector {
    /**
     * constructor
     */
    constructor() {
        this.cf = [];
        this.variables = [];
        this.threshold = 0.9;
    }
    /**
     * finds max distance between point and line (Y axis only)
     * @param {array(Point)} points 
     * @param {Line} line 
     * @returns float
     */
    findThreshold(points, line) {
        let max = 0;
        let size = points.length;
        for (let i = 0; i < size; i++) { // iterate over points
            let d = Math.abs(points[i].y - line.f(points[i].x)); // calc distance to line
            if (d > max) { // if d > max distance
                max = d; // update max distance
            }
        }
        return max;
    }
    /**
     * This function checks if the max_correlation if high enough and if so it creates a new correlatedFeatures object
     * and sets its fields and pushes it into this.cf
     * @param {float} max_correlation 
     * @param {string} f1 
     * @param {string} f2 
     * @param {array(Point)} points 
     * @param {boolean} mode 
     */
    learnHelper(max_correlation, f1, f2, points, mode) {
        if(max_correlation > this.threshold){ // linear regression
            let c = new correlatedFeatures();
            c.feature1=f1;
            c.feature2=f2;
            c.correlation=max_correlation;
            c.lin_reg=linear_reg(points); // get linear regression from points.
            c.threshold=this.findThreshold(points ,c.lin_reg)*1.1; // find threshold and give 10%.
            this.cf.push(c); // add to this.cf.
        }
        else if (max_correlation > 0.5 && max_correlation < this.threshold && mode) { // hybrid 
            let c = new correlatedFeatures();
            let cl = enclosingCircle(points); // get min enclosing circle
            c.feature1=f1;
            c.feature2=f2;
            c.correlation=max_correlation;
            c.threshold=cl.r*1.1; // 10% increase
            c.x=cl.x;
            c.y=cl.y;
            this.cf.push(c); // add to this.cf.
        }    
    }
    /**
     * This function finds all correlated features, adds them to this.cf, according to the mode.
     * @param {TimeSeries} ts 
     * @param {boolean} mode 
     */
    learnNormal (ts, mode) {
        let atts = ts.getAttributes();
        let size = atts.length;
        let vals = []; // matrix of all data
        for (let i = 0; i < atts.length; i++) { // iterate over ts.table
            let x = ts.getAttData(atts[i]);
            vals.push([]);
            for (let j = 0; j < size; j++) { // push all values of map to vals
                vals[i].push(x[j]);
            }
        }
        let found_before = [];
        for (let i = 0; i < size; i++) { // iterate over vals
            let f1 = atts[i];
            for (let c of this.cf) { // iterate over correaltedFeatures found already
                let first = c.feature1;
                let second = c.feature2;
                if (found_before.indexOf(first) == -1) { // if c.feature1 attribute already matched before continue
                    found_before.push(first);
                }
                if (found_before.indexOf(second) == -1) { // if c.feature2 attribute already matched before continue
                    found_before.push(second);
                }
            }
            if (found_before.indexOf(f1) > -1) { // if f1 attribute already matched before continue
                continue;
            }
            let max_correlation = 0;
            let jmax = 0;
            for (let j = i+1; j < size; j++) {
                let fj = atts[j];
                if (found_before.indexOf(fj) > -1) { // if f2 attribute already matched before continue
                    continue;
                }
                let correlation = Math.abs(pearson(vals[i], vals[j])); // find correaltion between f1,f2
                    if (correlation > max_correlation) { // if correlation is greater than max correaltion found
                        max_correlation = correlation; // update variables
                        jmax = j;
                    }
            }
            let points = [];
            let f2 = atts[jmax];
            for (let i = 0; i < ts.getRowSize(); i++) { // create points array
                points.push(new Point(ts.getAttData(f1)[i], ts.getAttData(f2)[i]));
            }
            this.learnHelper(max_correlation, f1, f2, points, mode); // call this.learnHelper on local variables
        }
    }
    /**
     * This function checks if current point is an anomaly, linear regression mode
     * @param {float} x 
     * @param {float} y 
     * @param {correlatedFeatures} c 
     * @returns 
     */
    regularAnomalus(x, y, c) {
        return (Math.abs(y - c.lin_reg.f(x)) > c.threshold);
    }
    /**
     * This function checks if current point is an anomaly, Hybrid mode
     * @param {float} x 
     * @param {float} y 
     * @param {correlatedFeatures} c 
     * @param {boolean} mode
     * @returns 
     */
    multiIsAnomalous(x, y, c, mode) {
        return (c.correlation >= this.threshold && this.regularAnomalus(x,y,c)) || (mode && c.correlation > 0.5 && c.correlation < 0.9 && distance(new Point(c.x, c.y), new Point(x,y)) > c.threshold);
    }
    /**
     * This function finds all anomalies, based on TimeSeries provided and mode.
     * @param {TimeSeries} ts 
     * @param {boolean} mode 
     * @returns string of JSON anomalies found
     */
    detect(ts, mode) {
        let anomalys = [];
        if (this.cf.length == 0) {
            return anomalys;
        }
        for (let correlated of this.cf) { // iterate over correaltedFeatures array
            let x = ts.getAttData(correlated.feature1); // get array(float)
            let y = ts.getAttData(correlated.feature2); // get array(float)
            for (let i = 0; i < x.length; i++) {
                if (this.multiIsAnomalous(x[i], y[i], correlated, mode)) { // check if current point is an anomaly
                    anomalys.push(new AnomalyReport(correlated.feature1 + "-" + correlated.feature2, i+1)); // add anomaly
                }
            }
        }
        let dict = new Map(); // new map that we will convert to JSON later
        for (let anomaly of anomalys) { // iterate over anomalys
            if (dict.has(anomaly.desc)) { // check if we allready have this key
                dict.get(anomaly.desc).push(anomaly.time); // add anomaly to array
            } else { // new key
                dict.set(anomaly.desc, [anomaly.time]); // add key value pair to map
            }
        }
        /*
         convert map to JSON
        */
        let obj = {};
        dict.forEach(function(value, key){
        obj[key] = value
        });
        //console.log(obj);
        return JSON.stringify(obj); // return JSON string
    }
}

module.exports = {
    SimpleAnomalyDetector, correlatedFeatures
}
