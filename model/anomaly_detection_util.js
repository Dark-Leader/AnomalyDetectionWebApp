'use strict';

/**
 * Represents a line in 2d space, has slope and intersection point with y-axis.
 */
class Line {
    /**
     * constructor
     * @param {Point} a 
     * @param {Point} b 
     */
    constructor(a, b) {
        this.a = a; // slope
        this.b = b; // intersection point with y-axis => only y-coordinate
    }
    /**
     * calcutes a * x + b value
     * @param {float} x 
     * @returns float
     */
    f(x) { 
        return this.a * x + this.b;
    }
}
/**
 * Represents a point in 2d space
 */
class Point {
    /**
     * constructor
     * @param {float} x 
     * @param {float} y 
     */
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}
/**
 * calcutes distace between two points
 * @param {Point} p1 
 * @param {Point} p2 
 * @returns float
 */
function distance(p1, p2) {
    let x2 = (p1.x - p2.x)*(p1.x - p2.x);
    let y2 = (p1.y - p2.y)*(p1.y - p2.y);
    return Math.sqrt(x2 + y2);
}
/**
 * calcuates mean (average) of an array of floats
 * @param {array(float)} arr 
 * @returns float
 */
function mean(arr) {
    let sum = 0
    for (const value of arr) {
        sum += value;
    }
    return sum / arr.length;
}
/**
 * calcuates variance of an array of floats
 * @param {array(float)} arr 
 * @returns float
 */
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
/**
 * calculates co-variance of 2 arrays of floats
 * @param {array(float)} arr_x 
 * @param {array(float)} arr_y 
 * @returns float
 */
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
/**
 * calcutes correaltion between two arrays of floats
 * @param {array(float)} arr_x 
 * @param {array(float)} arr_y 
 * @returns float
 */
function pearson(arr_x, arr_y) {
    let covariance = cov(arr_x, arr_y);
    let var_x = Math.sqrt(variance(arr_x));
    let var_y = Math.sqrt(variance(arr_y));
    return covariance / (var_x * var_y);
}
/**
 * calcutes linear regression Line from array of points
 * @param {array(Point)} points 
 * @returns Line
 */
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
/**
 * calculate distance between point and line (y-axis only)
 * @param {Point} point 
 * @param {Line} line 
 * @returns float
 */
function dev1(point, line) {
    let result = line.f(point.x) - point.y;
    if (result  < 0) {
        result *= -1;
    }
    return result;
}
/**
 * calculate distance between point and array of points
 * @param {Point} point
 * @param {array(Point)} points 
 * @returns float
 */
function dev2(point, points) {
    let line = linear_reg(points);
    return dev1(point, line);
}

module.exports = {
    Line, Point, mean, variance, cov, pearson, linear_reg, dev1, dev2, distance
};
