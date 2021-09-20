'use strict'
const router = require('express').Router()
const controllers = require('../controllers')

require('../middlewares/passport')

function logErrors(err, req, res, next) {
  console.error(err.stack)
  next(err)
}

function clientErrorHandler(err, req, res, next) {
  res.status(500).send({ error: 'Something failed!' })
}

router.route(['/', '/login', '/home']).get(controllers.index)

module.exports = (app) => {
  app.use('/', router)
  app.use('/auth', require('./auth'))
  app.use('/users', require('./user'))
  app.use('/friends', require('./friend'))
  app.use('/roooms', require('./room'))
  app.use(logErrors)
  app.use(clientErrorHandler)
  // app.use(errorHandler)
}
