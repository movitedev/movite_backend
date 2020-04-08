module.exports = function(io){
    
  const jwt = require('jsonwebtoken');
  const User = require('../models/userModel');
  const {ObjectID} = require('mongodb');
  const dotenv = require('dotenv');

  dotenv.config();

    io
    .of('/chats')
    .on('connection', function(socket) {
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    console.log("Connect");

    socket.on('room', async function(room) {

      //room is userid

      console.log("Room");

      if (socket.handshake.query && socket.handshake.query.token){

        try {

      if (!ObjectID.isValid(room)) {
        throw new Error();
      }

      const token = socket.handshake.query.token;
        
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
     
      const user  = await User.findOne({ _id:decoded._id, 'tokens.token': token});

      if(!user){
        throw new Error();
    }
      
      if(!(user._id.equals(room))){
        throw new Error();
      }
      
      socket.join(room);

    }
    catch (error) {
          console.log(error);
    }
    }
    });
  });

  /*

  room = "abc123";
io.sockets.in(room).emit('message', 'what is going on, party people?');
*/

}