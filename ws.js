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

    socket.on('disconnect', () => {
      if(socket.room) {
        io.to(socket.room).emit('left room', socket.id)
        socket.leave(socket.room)
      }
    })

    socket.on('gaze', GazeData => {
      if(socket.room) {
        GazeData.sid = socket.id
        socket.to(socket.room).emit('gaze', GazeData);
      }
    })

  });
}
