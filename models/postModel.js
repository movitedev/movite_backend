const mongoose = require('mongoose');

const postSchema  = new mongoose.Schema({
    title:{
        type:String,
        unique:true,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required:true,
        trim: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
});

postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId'
})

const Post = mongoose.model('Post', postSchema);

module.exports = Post;