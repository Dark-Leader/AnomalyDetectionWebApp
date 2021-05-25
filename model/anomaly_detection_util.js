'use strict';

class Line {
    constructor(a, b) {
        this.a = a;
        this.b =b;
    }
    f(x) {
        return this.a * x + this.b;
    }
}

class Point {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

function distance(p1, p2) {
    let x2 = (p1.x - p2.x)*(p1.x - p2.x);
    let y2 = (p1.y - p2.y)*(p1.y - p2.y);
    return Math.sqrt(x2 + y2);
}

function mean(arr) {
    let size = arr.length;
    let sum = 0
    for (const value of arr) {
        sum += value;
    }
    return sum / size;
}

function variance(arr) {
    let size = arr.length;
    let avg = 0;
    let sum_squared = 0;
    for (const value of arr) {
        avg += value;
        sum_squared += value * value;
    }
    avg /= size;
    return sum_squared / size - avg * avg;
}

function cov(arr_x, arr_y) {
    let size = arr_x.length;
    let covariance = 0;
    let avg_x = mean(arr_x);
    let avg_y = mean(arr_y);
    for (let i = 0; i < size; i++) {
        covariance += (arr_x[i] - avg_x) * (arr_y[i] - avg_y);
    }
    return covariance / size;
}

function pearson(arr_x, arr_y) {
    let covariance = cov(arr_x, arr_y);
    let var_x = Math.sqrt(variance(arr_x));
    let var_y = Math.sqrt(variance(arr_y));
    return covariance / (var_x * var_y);
}

function linear_reg(points) {
    let x = [];
    let y = [];
    for (const point of points) {
        x.push(point.x);
        y.push(point.y);
    }
    let a = cov(x, y) / variance(x);
    let b = mean(y) - a * mean(x);
    let line = new Line(a,b);
    return line;
}

function dev1(point, line) {
    let result = line.f(point.x) - point.y;
    if (result  < 0) {
        result *= -1;
    }
    return result;
}

function dev2(point, points) {
    let line = linear_reg(points);
    return dev1(point, line);
}

module.exports = {
    Line, Point, mean, variance, cov, pearson, linear_reg, dev1, dev2, distance
};
