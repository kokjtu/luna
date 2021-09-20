const router = require('express').Router()
const passport = require('passport')
const config = require('../config')
const {
  validateBody,
  validateParam,
  schemas,
} = require('../helpers/router')
const AuthController = require('../controllers/auth')

router
  .route('/signup')
  .post(validateBody(schemas.authSignUpSchema), AuthController.signUp)

router
  .route('/signin')
  .post(
    validateBody(schemas.authSignInSchema),
    passport.authenticate('local', { session: false }),
    AuthController.signIn
  )

router.use(passport.authenticate('jwt', { session: false }))

router.route('/me').get(AuthController.me)

module.exports = router
