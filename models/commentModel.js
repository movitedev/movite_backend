const mongoose = require('mongoose');

const commentSchema  = new mongoose.Schema({
    comment:{
        type:String,
        trim: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Post'
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;