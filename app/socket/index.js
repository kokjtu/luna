'use strict'
const SocketHelper = require('../helpers/socket')
const passport = require('passport')

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

module.exports = (io) => {
  io.use(wrap(passport.authenticate('jwt', { session: false })))

  io.on('connection', async (socket) => {
    console.log('CONNECT', socket.id)
    let socketHelper = new SocketHelper(socket)
    await socketHelper.userStatus('online')

    socket.on('CREATE_ROOM', async (data) => {
      let room = await socketHelper.createRoom(data.name, data.userIDs)
      io.to(room._id.toString()).emit('NEW_ROOM', room)
    })

    socket.on('SEND_MESSAGE', async (data) => {
      console.log('SEND_MESSAGE', data)
      let room
      if (data.roomID) {
        room = await socketHelper.checkRoom(data.roomID)
      } else if (data.userID) {
        room = await socketHelper.createRoom(data.name, [data.userID])
      }
      console.log('ROOMS', room._id, socket.adapter.rooms)
      if (room) {
        room = await socketHelper.createMessage(room._id, data.message)
        if (room) io.to(room._id.toString()).emit('RECEIVE_MESSAGE', room)
      }
    })

    socket.on('disconnect', () => {
      socketHelper.userStatus('offline')
    })
  })
}
