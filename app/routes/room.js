'use strict'
const router = require('express').Router()
const passport = require('passport')
const config = require('../config')
const { validateBody, validateParam, schemas } = require('../helpers/router')
const RoomController = require('../controllers/room')
const upload = require('./upload')

require('../middlewares/passport')

router.use(passport.authenticate('jwt', { session: false }))

router.route('/').get((req, res, next) => {
  res.status(200).json({'rooms': true})
})

router
  .route('/:roomID')
  .get(validateParam(schemas.idSchema, 'roomID'), RoomController.getRoom)
  // .put(validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userSchema), UserController.replaceUser)
  .patch(upload.single('avatar'), RoomController.updateRoom)
  .delete(validateParam(schemas.idSchema, 'roomID'), RoomController.deleteRoom)
module.exports = router
