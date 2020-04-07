module.exports = function(io){

  const jwt = require('jsonwebtoken');
  const User = require('../models/userModel');
  const Chat = require('../models/chatModel');
  const {ObjectID} = require('mongodb');
  const dotenv = require('dotenv');

  dotenv.config();
      
  io
  .of('/messages')
  .on('connection', function(socket) {
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    console.log("Connect");

    socket.on('room', async function(room) {

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

      const chat = await Chat.findOne({ _id:room, 'partecipants.partecipant': decoded._id })
      
      if(!chat){
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
}