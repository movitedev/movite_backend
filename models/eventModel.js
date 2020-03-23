const mongoose = require('mongoose');

const eventSchema  = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    eventDate:{
        type: Date,
    },
    runs:[{
        run:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Run'
        }
    }],    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;