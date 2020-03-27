const mongoose = require('mongoose');

const runSchema  = new mongoose.Schema({
    name:{
        type:String,
        trim: true
    },
    from:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Location'
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Location'
    },
    driver:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    eventDate:{
        type: Date,
        required:true
    },
    passengers:[{
        passenger:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now()
    }
});

const Run = mongoose.model('Run', runSchema);

module.exports = Run;