var _ = require('lodash')

module.exports = (io, app) => {
  app.io = io

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join room', room => {
      if (socket.room) {
        socket.leave(socket.room)
      }
      room = room + ''
      socket.join(room)
      socket.room = room
    })

    socket.on('gaze', GazeData => {
      if(socket.room) {
        socket.to(socket.room).emit('gaze', GazeData);
      }
    })

  });
}
