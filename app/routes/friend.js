const router = require('express').Router()
const passport = require('passport')
const config = require('../config')
const {
  validateBody,
  validateParam,
  schemas,
} = require('../helpers/router')
const AuthController = require('../controllers/friend')

require('../middlewares/passport')

router.use(passport.authenticate('jwt', { session: false }))

router
  .route('/')
  .get(AuthController.getFriends)
  .post(AuthController.requestFriend)
  .patch(AuthController.acceptFriend)
  .delete(AuthController.deleteFriend)

module.exports = router
