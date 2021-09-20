'use strict'

const express = require('express'),
  app = express(),
  luna = require('./app'),
  passport = require('passport'),
  path = require('path'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  cors = require('cors')

app.set('port', process.env.PORT || 3000)
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Middlewares
app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())

app.use(passport.initialize())
app.use(passport.session())

luna.router(app)

luna.ioServer(app).listen(app.get('port'), () => {
  console.log('Luna is runing on port', app.get('port'))
})
