const User = require('../models/User')
const mongoose = require('mongoose')

const getFriends = async (req, res, next) => {
  let userID = req.user._id
  let users = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userID) } },
    {
      $project: {
        friends: {
          $filter: {
            input: '$friends',
            as: 'friend',
            cond: { $eq: ['$$friend.status', req.query.status] },
          },
        },
      },
    },
    {
      $unwind: {
        path: '$friends',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'friends.user',
        foreignField: '_id',
        as: 'friends.user',
      },
    },
    {
      $unwind: {
        path: '$friends.user',
      },
    },
    {
      $group: {
        _id: '$_id',
        friends: {
          $push: '$friends',
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: {
        path: '$userDetails',
      },
    },
    {
      $addFields: {
        'userDetails.friends': '$friends',
      },
    },
    {
      $replaceRoot: {
        newRoot: '$userDetails',
      },
    },
    {
      $project: {
        friends: 1,
        _id: 0,
      },
    },
  ])

  return res.status(200).json(users.length > 0 ? users[0].friends : [])
}

const requestFriend = async (req, res, next) => {
  try {
    const userID = req.user._id
    const { friendID } = req.body
    if (!friendID) throw new Error('Friend is not found')
    await Promise.all([
      User.findOneAndUpdate(
        { _id: userID, 'friends.user': { $ne: friendID } },
        {
          $push: {
            friends: {
              user: friendID,
              status: 'REQUESTED',
            },
          },
        },
        { new: true }
      ),
      User.findOneAndUpdate(
        { _id: friendID, 'friends.user': { $ne: userID } },
        {
          $push: {
            friends: {
              user: userID,
              status: 'PENDING',
            },
          },
        }
      ),
    ])
    return res.status(200).json({ success: true })
  } catch (error) {
    next(new Error('Friend is not found'))
  }
}
const acceptFriend = async (req, res, next) => {
  try {
    const userID = req.user._id
    const { friendID } = req.body
    if (!friendID) throw new Error('Friend is not found')
    await Promise.all([
      User.findOneAndUpdate(
        { _id: userID, 'friends.user': friendID },
        {
          $set: {
            'friends.$.status': 'ACCEPTED',
          },
        },
        { new: true }
      ),
      User.findOneAndUpdate(
        { _id: friendID, 'friends.user': userID },
        {
          $set: {
            'friends.$.status': 'ACCEPTED',
          },
        }
      ),
    ])
    return res.status(200).json({ success: true })
  } catch (error) {
    next(new Error('Friend is not found'))
  }
}

const deleteFriend = async (req, res, next) => {
  try {
    const userID = req.user._id
    const { friendID } = req.body
    if (!friendID) throw new Error('Friend is not found')
    await Promise.all([
      User.findOneAndUpdate(
        { _id: userID },
        {
          $pull: {
            friends: {
              user: friendID,
            },
          },
        },
        { new: true }
      ),
      User.findOneAndUpdate(
        { _id: friendID },
        {
          $pull: {
            friends: {
              user: userID,
            },
          },
        }
      ),
    ])
    return res.status(200).json({ success: true })
  } catch (error) {
    next(new Error('Friend is not found'))
  }
}

module.exports = {
  getFriends,
  requestFriend,
  acceptFriend,
  deleteFriend,
}
