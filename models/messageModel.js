const mongoose = require('mongoose');

const chatModel = require('./chatModel');

const messageSchema  = new mongoose.Schema({
    message:{
        type:String,
        trim: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    chatId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Chat'
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    }
});

messageSchema.pre('save', async function(next){
    const message = this
    const chat = await chatModel.findOne({_id: message.chatId})
    
    if(chat){
        chat.lastUpdate = Date.now()
        await chat.save()
    }
    
    next()
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;