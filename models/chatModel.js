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

    this.partecipants = this.partecipants.filter((elem, index, self) => self.findIndex(
        (t) => {return (t.partecipant).equals(elem.partecipant)}) === index);


    next();
  });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;