const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const { Server } = require('socket.io')
const router = require('./router')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const Users = require('./modules/users/users.model')

const app = express()
const server = require('http').createServer(app)

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use('/api', router)

app.use('*', (req, res) => {
  res.status(404).send('Not found')
})

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      throw new Error('Authorization token is missing')
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)
    console.log(decoded)
    const user = await Users.findById(decoded.userId)

    if (!user) {
      throw new Error('User not found')
    }

    socket.user = user
    next()
  } catch (error) {
    console.error(error)
    next(new Error('Authentication error'))
  }
})

io.on('connection', (socket) => {
  console.log('New socket connection')
  console.log(socket.user)

  socket.on('message', (data) => {
    console.log('New message:', data)
    io.sockets.emit('new-message', data)
  })
})

module.exports = server
