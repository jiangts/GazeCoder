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

    socket.on('scroll', data => {
      if(socket.room) {
        data.sid = socket.id
        socket.to(socket.room).emit('scroll', data);
      }
    })

    socket.on('mouse', MouseData => {
      if(socket.room) {
        MouseData.sid = socket.id
        socket.to(socket.room).emit('mouse', MouseData);
      }
    })

  });
}
