'use strict'
const router = require('express').Router()
const passport = require('passport')
const config = require('../config')
const { validateBody, validateParam, schemas } = require('../helpers/router')
const UserController = require('../controllers/user')
const upload = require('./upload')

require('../middlewares/passport')

router.use(passport.authenticate('jwt', { session: false }))

router
  .route('/')
  .get(UserController.getUsers)
  .patch(
    upload.single('avatar'),
    // validateParam(schemas.idSchema, 'userID'),
    // validateBody(schemas.userOptionalSchema),
    UserController.updateUser
  )

router
  .route('/:userID')
  .get(validateParam(schemas.idSchema, 'userID'), UserController.getUser)
// .put(
//   validateParam(schemas.idSchema, 'userID'),
//   validateBody(schemas.userSchema),
//   UserController.replaceUser
// )

module.exports = router
