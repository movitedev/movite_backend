const runModel = require('../models/runModel');
const userModel = require('../models/userModel');
const {ObjectID} = require('mongodb');

module.exports = {
    create : async (req,res) => {
        delete req.body.createdAt
        delete req.body.passengers
        delete req.body.validated
        
        const run =  new runModel
    ({
            ...req.body,
            driver: req.user._id
        })
        try {
            await run.save()
            res.status(201).send(run)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    getAll : async (req,res) => {

        let after = req.query.after;

        try {
            let runs=[]
            if(after){
                runs = await runModel
                .find({"eventDate": {"$gte": after}})
            }else{
                runs = await runModel
                .find({})
            }
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
                return res.status(401).send()
            }

            res.send(await run.details());
        } catch (error) {
            res.status(500).send()
        }
    },
    validate : async (req,res) => {
        const _id =  req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }

        if(!req.body.code){
            return res.status(400).send()
        }

        try {
            const run = await runModel
        .findOne({ _id, driver: req.user._id})
            if(!run){
                return res.status(404).send()
            }

            const user = await userModel
            .findOne({ 'validRunCode.code': req.body.code})
                if(!user || user==req.user){
                    return res.status(400).send()
                } else{

                    if ((run.validated).some(e => e.passenger.equals(user._id))) {
                        return res.status(400).send()
                      }
                    }
                
                let timeDifference = Math.abs(Date.now() - user.validRunCode.generatedAt.getTime());
                let timeDifference2 = Math.abs(run.eventDate.getTime() - user.validRunCode.generatedAt.getTime());

                if(timeDifference > 1000*60*5 || timeDifference2 > 1000*60*100){
                    return res.status(409).send()
                }

                run.validated.push({passenger: user._id})

                await run.save()



                res.send({passenger: user})
        } catch (error) {
            console.log(error);
            res.status(500).send()
        }
    },
    modify :  async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["active"]
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
        .findOneAndDelete({_id:_id, driver: req.user._id})
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
        const allowedUpdates = ["active"]
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