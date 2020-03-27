module.exports = function(io){
    
  io
  .of('/messages')
  .on('connection', function(socket) {
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('room', function(room) {
        socket.join(room);
    });
});
}