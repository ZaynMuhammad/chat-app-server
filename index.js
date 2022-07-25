const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    }

})

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room })

        if (error) return callback(error)

        socket.emit('message', { user: 'admin', text: `${user.name} welcome to the room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined`})

        console.log('room', user.room)

        socket.join(user.room)

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        // Easy solution, better solution would be to attach id field to user obj
        if (socket.id === null)
            return

        const user = getUser(socket.id)

        io.to(user.room).emit('message', { user: user.name, text: message })
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    io.on('disconnection', () => {
        const user = removeUser(socket.id)

        if (user)
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the chat`})
    })
})

app.use(router)
app.use(cors())

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`))