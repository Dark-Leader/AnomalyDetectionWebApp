
/**
 * Represents an anomaly between two correlated features and a timestep for when said anomaly occured.
 */
class AnomalyReport {
    /**
     * constructor
     * @param {string} description 
     * @param {int} timeStep 
     */
    constructor(description, timeStep) {
        this.desc = description;
        this.time = timeStep;
    }
}

module.exports = {
    AnomalyReport
};
