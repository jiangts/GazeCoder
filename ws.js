module.exports = (io, app) => {
  app.io = io

  io.on('connection', (socket) => {
    console.log('a user connected');
  });
}
