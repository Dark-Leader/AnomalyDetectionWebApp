const express = require('express'); //returned a function
const fileUpload = require('express-fileupload');
const app = express(); //the function returnes a function of type Express. this represents our application
app.use(express.json()); //enable json parsing. a middle-ware is been returned to 'use'.
app.use(express.static('../view')); //now 'view' is the root direc.
app.use(express.urlencoded); //now url encoded
//require the model files here!!



/* GET requests */
//send to user the html 
app.get('/', (req, res) => {   
    res.sendFile("./index.html");
})



/* POST requests */
app.post('/detect', (req, res) => {
    // res.write('printing ' + req.body.normal_file);
    if(req.files){
        //var file = req.body.normal_file; //file obj.
        var string = toString(file.data); //content as string
        
    }
})



// temp JSON data
var anomalies = { aileron: "[0-10]", rudder: "[15-16]", slats: "[800-900, 940-942]" };


/**
 * detectCommand function. returns the anomalies as JSON

 * @param {*} req - the req object, represents user request
 * @param {*} res - the res object, represents our response to user
 */
function detectCommand(req, res) {
    let result = 'the anomalies are:\n';
    res.write(result);
    res.write(JSON.stringify(anomalies));
    res.end();
}






// logging are for test
app.listen(8080, () => {
    console.log('Listening on port 8080...');
})