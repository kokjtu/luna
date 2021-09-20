'use strict'

require('./models')()

let ioServer = (app) => {
  const server = require('http').Server(app)
  const io = require('socket.io')({
    serveClient: false,
    cors: {
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST'],
      allowedHeaders: ["Authorization"],
    },
  }).listen(server)
  // io.use((socket,next)=>{
  //     require('./session')(socket.request,{},next);
  // });
  require('./socket')(io)
  return server
}

module.exports = {
  router: require('./routes'),
  ioServer,
}
