const User = require('../models/User')
const JWT = require('jsonwebtoken')
const { JWT_SECRET, host } = require('../config')

const encodedToken = (userID) => {
  return JWT.sign(
    {
      iss: 'kokjtu',
      sub: userID,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 3),
    },
    JWT_SECRET
  )
}

const me = async (req, res, next) => {
  let { _id, firstName, lastName, email, avatar } = req.user
  return res.status(200).json({
    _id,
    firstName,
    lastName,
    email,
    avatar,
  })
}

const signIn = async (req, res, next) => {
  const token = encodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ token })
}

const signUp = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.value.body

  const foundUser = await User.findOne({ email })
  if (foundUser)
    return res
      .status(403)
      .json({ error: { message: 'Email is already in use' } })

  const newUser = new User({
    firstName,
    lastName,
    avatar: host + '/uploads/avatar_default.jpg',
    email,
    password,
  })
  newUser.save()

  const token = encodedToken(newUser._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true })
}

module.exports = {
  me,
  signIn,
  signUp,
}
