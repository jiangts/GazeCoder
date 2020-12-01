var _ = require('lodash')
const winston = require('winston');
const path = require('path');
const {transports, createLogger, format} = require('winston');

const makeLogger = filename => {
  filename = path.join(__dirname, 'public/logs', filename)
  const logger = createLogger({
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new transports.File({filename})
    ]
  });
  return logger
}

const loggers = {}

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
      if(!loggers.room) {
        loggers.room = makeLogger(room+'.jsonl')
      }
    })

    socket.on('disconnect', () => {
      if(socket.room) {
        io.to(socket.room).emit('left room', socket.id)
        loggers.room.info({ event: 'left room', data: socket.id })
        socket.leave(socket.room)
      }
    })

    socket.on('gaze', GazeData => {
      if(socket.room) {
        GazeData.sid = socket.id
        socket.to(socket.room).emit('gaze', GazeData);
        loggers.room.info({ event: 'gaze', data: GazeData })
      }
    })

    socket.on('scroll', data => {
      if(socket.room) {
        data.sid = socket.id
        socket.to(socket.room).emit('scroll', data);
        loggers.room.info({ event: 'scroll', data })
      }
    })

    socket.on('mouse', MouseData => {
      if(socket.room) {
        MouseData.sid = socket.id
        socket.to(socket.room).emit('mouse', MouseData);
        loggers.room.info({ event: 'mouse', data: MouseData })
      }
    })

  });
}
