const mongoose = require('mongoose');

const chatSchema  = new mongoose.Schema({
    partecipants:[{
        partecipant:{
            type: mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'User'
        },
        lastView:{
            type: Date,
            required: true,
            default: Date(0)
        }
    }],
    lastUpdate:{
        type: Date,
        required: true,
        default: Date.now()
    },
    createdAt:{
        type: Date,
        immutable: true,
        default: Date.now()
    }
});

chatSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chatId'
})

chatSchema.pre('save', function (next) {
    this.lastUpdate = Date.now()

    let arr = this.partecipants;

    const result = [];
    arr.sort((a,b) => a.partecipant - b.partecipant);
    arr.forEach(el => {
    const last = result[result.length-1];
    if (el.partecipant === last.partecipant) continue;
    result.push(el);
    });

    this.partecipants = result;

    next();
  });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;