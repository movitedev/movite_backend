const userModel = require('../models/userModel');
const {ObjectID} = require('mongodb');

module.exports = {
    create :  async (req,res) => {
        delete req.body.role
        delete req.body.validRunCode
        delete req.body.tokens
        delete req.body.createdAt
        let user = new userModel(req.body);
        try{
            const token = await user.newAuthToken()
            res.status(201).send({user, token})
        }catch(e){
            res.status(400).send(e)
        }
    },
    getOne : async (req,res) => {
        const _id =  req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const post = await userModel.findOne({ _id })
            if(!post){
                return res.status(404).send()
            }
            res.send(post);
        } catch (error) {
            res.status(500).send()
        }
    },
    getMe: async (req,res)=> {
        res.send(req.user)
     },
     modifyMe : async (req,res) => {
        const updates  = Object.keys(req.body)
        const allowedUpdates = ["name", "email", "password", "age"]
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        const _id =  req.user._id
    
        if(!isValidOperation){
            return res.status(400).send({error:'Invalid request'})
        }
    
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
    
        try {        
            updates.forEach((update) => req.user[update] = req.body[update]) 
            await req.user.save()
            res.send(req.user);
        } catch (error) {
            res.status(400).send()
        }
    
    },
    removeMe : async (req,res) => {
        if (!ObjectID.isValid(req.user._id)) {
            return res.status(404).send();
        }
    
        try {
            await req.user.remove()
            res.send(req.user)
        } catch (error) {
            res.status(500).send()
        }
    },
    login : async (req, res) => {
        try {
            const user = await userModel.checkValidCredentials(req.body.email, req.body.password)
            const token = await user.newAuthToken()
            console.log(user,token)
            res.send({ user, token})
        } catch (error) {
            console.log(error);
            res.status(400).send({error})        
        }
    },
    code : async (req, res) => {
        if (!ObjectID.isValid(req.user._id)) {
            return res.status(404).send();
        }
        try {        
            const validRunCode = await req.user.newValidRunCode()
            console.log(validRunCode)
            res.send({validRunCode: validRunCode})
        } catch (error) {
            res.status(400).send()
        }
    },
    logout : async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) =>{
             return token.token !== req.token 
            })
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    },
    logoutAll : async (req, res) => {
        try {
            req.user.tokens = []
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyUser :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "age", "email", "role"]
        const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).send({error:'Invalid updates'})
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const user = await userModel.findOne({_id: req.params.id})
            
           if(!user){
               return res.status(404).send();
           }
    
           updates.forEach((update) => user[update] = req.body[update])
           await user.save()
    
           res.send(user);
        } catch (error) {
            res.status(400).send();
        }
    },
    removeUser :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deleteuser = await userModel.findOneAndDelete({_id:_id})
            if (!deleteuser) {
                return res.status(404).send();
            }
            res.send(deleteuser)
        } catch (error) {
            res.status(500).send()
        }
    }
}