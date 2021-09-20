const Room = require('../models/Room')
const User = require('../models/User')
const mongoose = require('mongoose')

const getRooms = async (req, res, next) => {
  console.log('GET_ROOMS')
  if (req.query && req.query.friendID) {
    let userIDs = [
      ...new Set([req.query.friendID, req.user._id.toString()]),
    ].sort()
    const room = await Room.aggregate([
      { $match: { users: userIDs.map((id) => mongoose.Types.ObjectId(id)) } },
      {
        $lookup: {
          from: 'users',
          localField: 'users',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                avatar: 1,
                online: 1,
              },
            },
          ],
          as: 'users',
        },
      },
    ])
    return res.status(200).json(room ? room[0] : null)
  }
  let user = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(req.user._id) } },
    {
      $unwind: {
        path: '$rooms',
      },
    },
    {
      $lookup: {
        from: 'rooms',
        localField: 'rooms.room',
        foreignField: '_id',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'users',
              foreignField: '_id',
              pipeline: [
                {
                  $project: {
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                    online: 1,
                  },
                },
              ],
              as: 'users',
            },
          },
        ],
        as: 'rooms.room',
      },
    },
    {
      $unwind: {
        path: '$rooms.room',
      },
    },
    {
      $group: {
        _id: '$_id',
        rooms: {
          $push: '$rooms',
        },
      },
    },
    {
      $project: {
        rooms: 1,
        _id: 0,
      },
    },
  ])
  let rooms = user[0] ? user[0].rooms : []
  return res.status(200).json(rooms)
}

const getRoom = async (req, res, next) => {
  try {
    const { roomID } = req.value.params
    if (!roomID) throw new Error('Room is not found')
    const room = await Room.findById(roomID)
    return res.status(200).json(room)
  } catch (error) {
    next(new Error('Room is not found'))
  }
}

const updateRoom = async (req, res, next) => {
  const { roomID } = req.value.params

  const newRoom = req.value.body

  const room = await Room.findByIdAndUpdate(
    roomID,
    {
      ...newRoom,
      avatar: '/' + req.file.path,
    },
    { new: true }
  )

  return res.status(200).json(room)
}

const deleteRoom = async (req, res, next) => {
  try {
    const userID = req.user._id
    const { roomID } = req.value.params
    if (!roomID) throw new Error('Room is not found')
    await User.findOneAndUpdate(
      { _id: userID },
      {
        $pull: {
          rooms: {
            room: roomID,
          },
        },
      }
    )
    let room = await Room.findByIdAndUpdate(
      roomID,
      {
        $pull: {
          users: userID,
        },
      },
      { new: true }
    )
    if (room.users.length == 0) await Room.findOndAndDelete({ _id: roomID })
    return res.status(200).json({ success: true })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
}
