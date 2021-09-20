const config = require('../config')
const mongoose = require('mongoose')

module.exports = () => {
  mongoose
    .connect(config.dbURI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    .then(() => console.log('✅ Connected database from mongodb.'))
    .catch((error) =>
      console.error(
        `❌ Connect database is failed with error which is ${error}`
      )
    )
}
