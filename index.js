const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
app.use(cors())
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
    }

})

// io.on('connection', (socket) => {
//     socket.on('join', ({ name, room }, callback) => {
//         const { error, user } = addUser({ id: socket.id, name, room })

//         if (error) return callback(error)

//         socket.emit('message', { user: 'admin', text: `${user.name} welcome to the room ${user.room}` })
//         socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined`})

//         socket.join(user.room)
//         console.log('connected')

//         io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

//         callback()
//     })

//     socket.on('sendMessage', (message, callback) => {
//         // Easy solution, better solution would be to attach id field to user obj
//         if (socket.id === null)
//             return

//         const user = getUser(socket.id)

//         io.to(user.room).emit('message', { user: user.name, text: message })
//         io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

//         callback()
//     })

//     io.on('disconnection', () => {
//         const user = removeUser(socket.id)

//         if (user)
//             io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the chat`})
//     })
// })

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room })

        if (error) return callback(error)

        socket.emit('message', { user: 'admin', text: `${user.name} welcome to the room ${user.room}` })
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined` })

        socket.join(user.room)

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        if (!user) {
            console.log(`No user found for id ${socket.id}`)
            return
        }

        io.to(user.room).emit('message', { user: user.name, text: message })
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user)
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left the chat` })
    })
})

app.use(router)

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`))