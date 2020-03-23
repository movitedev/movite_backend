const mongoose = require('mongoose');

const chatSchema  = new mongoose.Schema({
    partecipants:[{
        partecipant:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User'
        }
    }],
    lastUpdate:{
        type: Date,
        required: true,
        default: Date.now
    },
    createdAt:{
        type: Date,
        immutable: true,
        default: Date.now
    }
});

chatSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chatId'
})

chatSchema.pre('save', function (next) {
    this.partecipants = [ ...new Set(this.partecipants)]
    next();
  });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;