const fs = require('fs')
const http = require('http')
const static = require('node-static')

const STORE_DIR = './store'
const HISTORY_FILE = `${STORE_DIR}/history.json`

if(!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR)
}
if(!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '[]')
}

// run http server
http.createServer((request, response) => {
    new static.Server('./dist/client/').serve(request, response)
}).listen(8080, err => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log('server is listening on localhost:8080')
})

// run websocket server
const WebSocket = require('ws')
const server = new WebSocket.Server({ port: 3000 })

server.on('connection', ws => {
    ws.on('message', message => {
        const history = JSON.parse(fs.readFileSync(HISTORY_FILE))
        message = JSON.parse(message)
        message.push(new Date().toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric', second: 'numeric'}))
        history.push(JSON.stringify(message))
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history))
        
        for(let client of server.clients) {
            if(client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
            }
        }
    })

    ws.send(fs.readFileSync(HISTORY_FILE).toString())
})
