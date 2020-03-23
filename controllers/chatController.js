const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const {ObjectID} = require('mongodb');

module.exports = {
    create : async (req,res) => {
        const chat =  new chatModel({
            ...req.body,
            author: req.user._id
        })
        try {
            await chat.save()
            res.status(201).send(chat)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    getAll : async (req,res) => {
        try {
            const chats = await chatModel.find({ _id, 'partecipants.partecipant': req.user._id })
            res.send(chats)
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
            const chat = await chatModel.findOne({ _id, 'partecipants.partecipant': req.user._id })
            if(!chat){
                return res.status(404).send()
            }
            res.send(chat);
        } catch (error) {
            res.status(500).send()
        }
    },
    writeMessage : async (req,res) => {   
        const _id = req.params.id
        const userid = req.user._id
    
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
    
        if (!ObjectID.isValid(userid)) {
            return res.status(404).send();
        }

        const chat = await chatModel.findOne({_id: _id, 'partecipants.partecipant': req.user._id})
        if (!chat) {
            return res.status(404).send();
        }
    
        const message = new messageModel({
            ...req.body,
            author: userid,
            chatId: _id
        })
    
        try {
            await message.save()
            res.status(201).send(message)
        } catch (error) {
            res.status(400).send(error)
        }
    
    },
    getMessagesOfChat : async (req,res) => {
        try {
            const chat = await chatModel.findOne({_id: req.params.id, 'partecipants.partecipant': req.user._id})
            await chat.populate('messages').execPopulate()
            res.send(chat.messages)
        } catch (error) {
            res.status(500).send()
        }
    },
    remove :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deletechat = await chatModel.findOneAndDelete({_id:_id, 'partecipants.partecipant': req.user._id})
            if (!deletechat) {
                return res.status(404).send();
            }
            res.send(deletechat)
        } catch (error) {
            res.status(500).send()
        }
    },
    getAllChats : async (req,res) => {
        try {
            const chats = await chatModel.find({ _id })
            res.send(chats)
        } catch (error) {
            res.status(500).send()
        }
    },
    getOneChat : async (req,res) => {
        const _id =  req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const chat = await chatModel.findOne({ _id })
            if(!chat){
                return res.status(404).send()
            }
            res.send(chat);
        } catch (error) {
            res.status(500).send()
        }
    },
    removeChat :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deletechat = await chatModel.findOneAndDelete({_id:_id})
            if (!deletechat) {
                return res.status(404).send();
            }
            res.send(deletechat)
        } catch (error) {
            res.status(500).send()
        }
    }
};