const runModel = require('../models/runModel');
const {ObjectID} = require('mongodb');

module.exports = {
    create : async (req,res) => {
        const run =  new runModel
    ({
            ...req.body,
            author: req.user._id
        })
        try {
            await run.save()
            res.status(201).send(run)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    getAll : async (req,res) => {
        try {
            const runs = await runModel
        .find({})
            res.send(runs)
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
            const run = await runModel
        .findOne({ _id})
            if(!run){
                return res.status(404).send()
            }
            res.send(run);
        } catch (error) {
            res.status(500).send()
        }
    },
    getOneDetails : async (req,res) => {
        const _id =  req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
        .findOne({ _id, $or: [{'driver': req.user._id}, {'passengers.passenger': req.user._id}]} )
            if(!run){
                return res.status(404).send()
            }
            res.send(run);
        } catch (error) {
            res.status(500).send()
        }
    },
    modify :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name"]
        const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).send({error:'Invalid updates'})
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
        .findOne({_id: req.params.id, author:req.user._id})
            
           if(!run){
            res.status(404).send();
           }
    
           updates.forEach((update) => run[update] = req.body[update])
           await run.save()
    
           res.send(run);
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
            const deleterun = await runModel
        .findOneAndDelete({_id:_id, author: req.user._id})
            if (!deleterun) {
                return res.status(404).send();
            }
            res.send(deleterun)
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyRun :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name"]
        const isValidOperation  = updates.every((update) => allowedUpdates.includes(update))
        if(!isValidOperation){
            res.status(400).send({error:'Invalid updates'})
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
        .findOne({_id: req.params.id})
            
           if(!run){
            return res.status(404).send();
           }
    
           updates.forEach((update) => run[update] = req.body[update])
           await run.save()
    
           res.send(run);
        } catch (error) {
            res.status(400).send();
        }
    },
    removeRun :  async (req,res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deleterun = await runModel
        .findOneAndDelete({_id:_id})
            if (!deleterun) {
                return res.status(404).send();
            }
            res.send(deleterun)
        } catch (error) {
            res.status(500).send()
        }
    }
};