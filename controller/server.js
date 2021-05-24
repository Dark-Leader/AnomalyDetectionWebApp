//imports modules
const http = require('http')
const fs = require('fs')

/**Methods**/
function displayFormCommand(req, res) {
    fs.readFile('../view/index.html', 'utf8', (err, data) => {
        if (err)
            console.log(err)
        else
            res.write(data)
        res.end()
    })
}

//creating map - using Command Design Pattern
let commands = new Map()
commands.set('/', displayFormCommand)

//creating server and setting app commands Map as Listener
const server = http.createServer((req, res) => {
    if (commands.has(req.url))
        commands.get(req.url)(req, res)
    else
        res.write("Invalid request")
})

//start server at port 8080
server.listen(8080, () => console.log("server listening on port 8080"))