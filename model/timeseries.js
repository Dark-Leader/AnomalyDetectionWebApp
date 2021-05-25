const fs = require('fs');

class TimeSeries {
    constructor(CSVfile) {
        this.csvfile = CSVfile;
        this.atts = [];
        this.dataSize = 0;
        this.table = this.fillMap(CSVfile);
        
    }

    fillMap(CSVfile) {
        let dict = new Object();
        const data = fs.readFileSync(CSVfile, 'utf8');
        let lines = data.split("\n");
        for(let i = 0; i < lines.length; i++) {
            let values = lines[i].split(",");
            if (i === 0) {
                for (let value of values) {
                    dict[value] = [];
                    this.atts.push(value);
                }
            } else {
                'use strict';
                let x = 0;
                for (const [key, value] of Object.entries(dict)) {
                    dict[key].push(parseFloat(values[x++]));
                }
            }
        }
        this.dataSize = dict[this.atts[0]].length;
        return dict;
    }

    getAttributes() {
        return this.atts;
    }

    getRowSize() {
        return this.dataSize;
    }

    getData() {
        return this.table;
    }

    getAttData(attribute) {
        return this.table[attribute];
    }
}

module.exports = {
    TimeSeries
};
