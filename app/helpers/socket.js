'use strict'
const Room = require('../models/Room')
const User = require('../models/User')
const mongoose = require('mongoose')
const crypto = require('crypto')
const io = require('socket.io')
const customHash = require('./hash')

module.exports = class SocketHelper {
  constructor(socket) {
    this.socket = socket
    this.user = socket.request.user
  }

  randomHex() {
    return crypto.randomBytes(24).toString('hex')
  }

  async userStatus(status) {
    if (status == 'online') {
      let user = await User.findOneAndUpdate(
        { _id: this.user._id },
        {
          $set: {
            online: true,
            socket: this.socket.id,
          },
        },
        { new: true }
      )
      user.rooms.forEach((r) => {
        let room = r.room.toString()
        this.socket.join(room)
        this.socket
          .to(room)
          .emit('USER_STATUS', { _id: this.user._id, online: true })
      })
    } else {
      let user = await User.findOneAndUpdate(
        { _id: this.user._id },
        {
          $set: {
            online: false,
          },
          $unset: {
            socket: '',
          },
        },
        { new: true }
      )
      user.rooms.forEach((r) => {
        let room = r.room.toString()
        this.socket.leave(room)
        this.socket
          .to(room)
          .emit('USER_STATUS', { _id: this.user._id, online: false })
      })
    }
  }

  async createRoom(name, userIDs) {
    // let room = await Room.findOne({ users: { $eq: userIDs } })
    // if (room) {
    //   room.users.push(this.user._id)
    //   await room.save()
    //   let user = await User.findByIdAndUpdate(this.user._id,{
    //     $push: {
    //       rooms: {
    //         name,
    //         room: room._id,
    //       },
    //     },
    //   })
    //   return room
    // }
    userIDs = [...new Set([...userIDs, this.user._id.toString()])].sort()
    if (userIDs.length < 2) return
    let room = await Room.findOne({ users: { $eq: userIDs } })
    if (!room) {
      room = await new Room({
        name,
        admin: this.user._id,
        users: userIDs,
      }).save()
      await Promise.all(
        userIDs.map(async (userID) => {
          let avatar = []
          if (userIDs.length == 2) {
            let otherID = userIDs.find((id) => id != userID)
            let user = await User.findById(otherID)
            if (user) {
              name = user.firstName + ' ' + user.lastName
              avatar = [user.avatar]
            }
          } else {
            const users = await User.find({ _id: { $in: userIDs } })
            avatar = users.map((u) => u.avatar)
            if (!name) {
              let otherIDs = userIDs.filter((id) => id != userID)
              let names = []
              for (let i = 0; i < otherIDs.length; i++) {
                let user = await User.findById(otherIDs[i])
                names.push(user.firstName + ' ' + user.lastName)
              }
              name = names.join(', ')
            }
          }
          return (async () => {
            let user = await User.findOneAndUpdate(
              { _id: userID },
              {
                $push: {
                  rooms: {
                    name,
                    avatar,
                    room: room._id,
                  },
                },
              },
              { new: true }
            )
            if (user.socket) {
              this.socket.nsp.sockets.get(user.socket).join(room._id.toString())
            }
          })()
        })
      )
    }
    return room
  }

  async checkRoom(roomID) {
    let room = await Room.findById(roomID)
    await Promise.all(
      room.users.map(async (userID) => {
        return (async () => {
          let user = await User.findById(userID)
          if (!user.rooms.find((r) => r.room == roomID)) {
            user.rooms.push({
              name: room.name,
              room: roomID,
            })
            await user.save()
            if (user.socket) {
              this.socket.nsp.sockets.get(user.socket).join(room._id.toString())
            }
          }
        })()
      })
    )
    return room
  }

  async createMessage(roomID, message) {
    let room = await Room.findOneAndUpdate(
      { _id: roomID },
      {
        $push: {
          messages: {
            user: this.user._id,
            content: message,
          },
        },
      },
      { new: true }
    )
    return room
  }
}
