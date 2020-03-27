const eventModel = require('../models/eventModel');
const runModel = require('../models/runModel');
const {ObjectID} = require('mongodb');

module.exports = {
    create : async (req,res) => {
        delete req.body.createdAt
        const event =  new eventModel({
            ...req.body,
            author: req.user._id
        })
        try {
            await event.save()
            res.status(201).send(event)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    getAll : async (req,res) => {
        try {
            const events = await eventModel.find({})
            res.send(events)
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
            const event = await eventModel.findOne({ _id })
            if(!event){
                return res.status(404).send()
            }
            res.send(event);
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
            const event = await eventModel.findOne({_id: req.params.id, author:req.user._id})
            
           if(!event){
               return res.status(404).send();
           }
    
           updates.forEach((update) => event[update] = req.body[update])
           await event.save()
    
           res.send(event);
        } catch (error) {
            res.status(400).send();
        }
    },
    addRun : async (req,res) => {   
        const _id = req.params.id
        const runId = req.params.runId    
        
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }

        if (!ObjectID.isValid(runId)) {
            return res.status(404).send();
        }
    
        try {
            const event = await eventModel.findOne({_id: _id })
            
            if(!event){
                return res.status(404).send();
            }

            const run = await runModel.findOne({_id: runId })
            
            if(!run){
                return res.status(404).send();
            }

            event.runs = user.runs.concat({ run })

           await event.save()
           res.send(event);
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
            const deleteEvent = await eventModel.findOneAndDelete({_id:_id, author: req.user._id})
            if (!deleteEvent) {
                return res.status(404).send();
            }
            res.send(deleteEvent)
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyEvent :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["description", "title"]
        const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            res.status(400).send({error:'Invalid updates'})
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const event = await eventModel.findOne({_id: req.params.id})
            
           if(!event){
            return res.status(404).send();
           }
    
           updates.forEach((update) => event[update] = req.body[update])
           await event.save()
    
           res.send(event);
        } catch (error) {
            res.status(400).send();
        }
    },
    removeEvent :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deleteEvent = await eventModel.findOneAndDelete({_id:_id})
            if (!deleteEvent) {
                return res.status(404).send();
            }
            res.send(deleteEvent)
        } catch (error) {
            res.status(500).send()
        }
    }
};