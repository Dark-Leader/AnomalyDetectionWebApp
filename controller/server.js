//imports modules
const http = require('http')
const fs = require('fs')

/**Methods**/
// displays the page
function displayFormCommand(req, res) {
    fs.readFile('../view/index.html', 'utf8', (err, data) => {
        if (err)
            console.log(err)
        else
            res.write(data)
        res.end()
    })
}

// temp JSON data
var anomalies = { aileron: "[0-10]", rudder: "[15-16]", slats: "[800-900, 940-942]" };

// returns the anomalies as JSON
function detectCommand(req, res) {
    let result = 'the anomalies are:\n';
    res.write(result);
    res.write(JSON.stringify(anomalies));
    res.end();
}


///////THIS SECTION DOES NOT RELATE TO EXPRESS - begin///////

//creating map - using Command Design Pattern
let commands = new Map()
commands.set('/', displayFormCommand)
commands.set('/detect', detectCommand)

//creating server and setting app commands Map as Listener
const server = http.createServer((req, res) => {
    if (commands.has(req.url))
        commands.get(req.url)(req, res)
    else
        res.write("Invalid request")
})

///////THIS SECTION DOES NOT RELATE TO EXPRESS - end///////

//start server at port 8080
server.listen(8080, () => console.log("server listening on port 8080"))