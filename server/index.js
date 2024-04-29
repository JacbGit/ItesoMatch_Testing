const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express()
const server = require('http').createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

app.use(cors())

app.get('*', (req, res) => {
    res.send("Server response!")
})

io.on('connection', (socket) => {
    console.log("New socket connection")

    socket.on("message", (data) => {
        console.log("New message:", data)
        io.sockets.emit("new-message", data)
    })
})

server.listen(3000, () => {
    console.log("Server listening on http://localhost:3000")
})