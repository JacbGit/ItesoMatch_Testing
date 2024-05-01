const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const router = require('./router')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

const app = express()
const server = require('http').createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use('/api', router)

app.use('*', (req, res) => {
  res.status(404).send('Not found')
})

io.on('connection', (socket) => {
  console.log('New socket connection')

  socket.on('message', (data) => {
    console.log('New message:', data)
    io.sockets.emit('new-message', data)
  })
})

module.exports = server
