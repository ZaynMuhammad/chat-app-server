const users = []

const addUser = ({ id, name, room }) => {

    // Need room and name to have no whitespaces and be lower case
    name = name.trim().toLowerCase()
    room = room.trim().toLowerCase()

    const existingUser = users.find((user) => user.room === room && user.name === name)

    if (existingUser)
        return { error: 'Username is taken' }

    const user = { id, name, room }

    users.push(user)

    return { user }
}


const removeUser = (id) => {
    const userIdx = users.findIndex((user) => user.id === id)

    if (userIdx !== -1)
        return users.splice(userIdx, 1)[0]
}

const getUser = (id) => users.find((user) => user.id === id)

const getUsersInRoom = (room) => users.filter((user) => user.room === room)

module.exports = { addUser, removeUser, getUser, getUsersInRoom }