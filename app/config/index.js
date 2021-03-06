'use strict'
// Config env
require('dotenv').config()

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  host: process.env.host || '',
  dbURI: process.env.dbURI,
  sessionSecret: process.env.sessionSecret,
  fb: {
    clientID: process.env.fbClientID,
    clientSecret: process.env.fbClientSecret,
    callbackURL: process.env.host + '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos'],
  },
  twitter: {
    consumerKey: process.env.twConsumerKey,
    consumerSecret: process.env.twConsumerSecret,
    callbackURL: process.env.host + '/auth/twitter/callback',
    profileFields: ['id', 'displayName', 'photos'],
  },
}
