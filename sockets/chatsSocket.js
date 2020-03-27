module.exports = function(io){
    
    io
    .of('/chats')
    .on('connection', function(socket) {
      // once a client has connected, we expect to get a ping from them saying what room they want to join
      socket.on('room', function(room) {
          socket.join(room);
      });
  });

  /*

  room = "abc123";
io.sockets.in(room).emit('message', 'what is going on, party people?');
*/

}