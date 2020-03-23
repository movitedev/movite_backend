const postModel = require('../models/postModel');
const commentModel = require('../models/commentModel');
const {ObjectID} = require('mongodb');

module.exports = {
    create : async (req,res) => {
        const post =  new postModel({
            ...req.body,
            author: req.user._id
        })
        try {
            await post.save()
            res.status(201).send(post)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    getAll : async (req,res) => {
        try {
            const posts = await postModel.find({})
            res.send(posts)
        } catch (error) {
            res.status(500).send()
        }
    },
    getOne : async (req,res) => {
        const _id =  req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const post = await postModel.findOne({ _id, author: req.user._id })
            if(!post){
                return res.status(404).send()
            }
            res.send(post);
        } catch (error) {
            res.status(500).send()
        }
    },
    comment : async (req,res) => {   
        const _id = req.params.id
        const userid = req.user._id
    
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
    
        if (!ObjectID.isValid(userid)) {
            return res.status(404).send();
        }
    
        const comment = new commentModel({
            ...req.body,
            author: userid,
            postId: _id
        })
    
        try {
            await comment.save()
            res.status(201).send(comment)
        } catch (error) {
            res.status(400).send(error)
        }
    
    },
    getCommentsOfPost : async (req,res) => {
        try {
            const post = await postModel.findOne({_id: req.params.id})
            await post.populate('comments').execPopulate()
            res.send(post.comments)
        } catch (error) {
            res.status(500).send()
        }
    },
    modify :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["description", "title"]
        const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).send({error:'Invalid updates'})
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const post = await postModel.findOne({_id: req.params.id, author:req.user._id})
            
           if(!post){
               return res.status(404).send();
           }
    
           updates.forEach((update) => post[update] = req.body[update])
           await post.save()
    
           res.send(post);
        } catch (error) {
            res.status(400).send();
        }
    },
    remove :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deletepost = await postModel.findOneAndDelete({_id:_id, author: req.user._id})
            if (!deletepost) {
                return res.status(404).send();
            }
            res.send(deletepost)
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyPost :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["description", "title"]
        const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).send({error:'Invalid updates'})
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const post = await postModel.findOne({_id: req.params.id})
            
           if(!post){
            return res.status(404).send();
           }
    
           updates.forEach((update) => post[update] = req.body[update])
           await post.save()
    
           res.send(post);
        } catch (error) {
            res.status(400).send();
        }
    },
    removePost :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deletepost = await postModel.findOneAndDelete({_id:_id})
            if (!deletepost) {
                return res.status(404).send();
            }
            res.send(deletepost)
        } catch (error) {
            res.status(500).send()
        }
    }
};