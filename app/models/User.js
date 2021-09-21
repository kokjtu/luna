'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')

const UserSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  avatar: {
    type: String,
    // data: Buffer,
    // contentType: String,
  },
  password: {
    type: String,
    required: true,
  },
  online: {
    type: Boolean,
    default: false,
  },
  socket: {
    type: String,
    unique: true,
    sparse: true,
  },
  friends: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enums: ['REQUESTED', 'PENDING', 'ACCEPTED'],
      },
    },
  ],
  rooms: [
    {
      name: {
        type: String,
      },
      avatar: [
        {
          type: String,
        },
      ],
      room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
      },
    },
  ],
})

UserSchema.pre('save', async function (next) {
  try {
    let user = this
    if (!user.isModified('password')) return next()
    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    // Generate a password hash (salt + hash)
    const passwordHashed = await bcrypt.hash(this.password, salt)
    // Re-assign password hashed
    this.password = passwordHashed
    next()
  } catch (error) {
    next(error)
  }
})

UserSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password)
  } catch (error) {
    throw new Error(error)
  }
}

let User = mongoose.model('User', UserSchema)

module.exports = User
