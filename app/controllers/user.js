const User = require('../models/User')
const mongoose = require('mongoose')
const { host } = require('../config')
const fs = require('fs')

const getUsers = async (req, res, next) => {
  let users = await User.find(req.query)
  users = users
    .filter((user) => req.user._id.toString() != user._id.toString())
    .map((user) => {
      let friend = user.friends.find(
        (f) => f.user.toString() == req.user._id.toString()
      )
      let friendStatus
      if (friend) {
        friendStatus = friend.status
        friend.status == 'PENDING' && (friendStatus = 'REQUESTED')
        friend.status == 'REQUESTED' && (friendStatus = 'PENDING')
      }
      return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        friendStatus,
      }
    })
  return res.status(200).json({ users })
}

const getUser = async (req, res, next) => {
  const { userID } = req.value.params

  const user = await User.findById(userID)
  return res.status(200).json({ user })
}

const replaceUser = async (req, res, next) => {
  // enforce new user to old user
  const { userID } = req.value.params

  const newUser = req.value.body

  const result = await User.findByIdAndUpdate(userID, newUser)

  return res.status(200).json({ success: true })
}

const updateUser = async (req, res, next) => {
  const userID = req.user._id

  const newUser = req.body

  let user = await User.findByIdAndUpdate(
    userID,
    {
      ...newUser,
    },
    { new: true }
  )

  if (req.file) {
    try {
      let filePath = user.avatar.replace(host + '/', '') 
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(error.message)
    }
    user.avatar = host + '/' + req.file.path
    user = await user.save()
  }

  let { _id, firstName, lastName, email, avatar } = user
  return res.status(200).json({
    _id,
    firstName,
    lastName,
    email,
    avatar,
  })
}

module.exports = {
  getUsers,
  getUser,
  replaceUser,
  updateUser,
}
