const runModel = require('../models/runModel');
const userModel = require('../models/userModel');
const { ObjectID } = require('mongodb');

module.exports = {
    create: async (req, res) => {
        delete req.body.createdAt
        delete req.body.passengers
        delete req.body.validated

        const run = new runModel
            ({
                ...req.body,
                driver: req.user._id
            })
        try {

            if (Date.now() > run.eventDate) {
                return res.status(409).send()
            }
            await run.save()
            res.status(201).send(run)
        } catch (error) {
            res.status(400).send(error)
        }
    },
    getAll: async (req, res) => {

        let after = req.query.after;

        try {
            let runs = []
            if (after) {
                runs = await runModel
                    .find({ "eventDate": { "$gte": after } })
            } else {
                runs = await runModel
                    .find({})
            }
            res.send(runs)
        } catch (error) {
            res.status(500).send()
        }
    },
    find: async (req, res) => {

        let from = req.body.from;
        let to = req.body.to;
        let eventDate = req.body.eventDate;

        let spaceOffset = req.body.spaceOffset;
        let timeOffset = req.body.timeOffset;

        if (!eventDate || !from || !to) {
            return res.status(400).send()
        }

        eventDate = new Date(eventDate);

        minTime = new Date().getTime() - 1000 * 60 * 60 * 2;

        let startDate = new Date(Math.max(eventDate.getTime() - 1000 * 60 * 60, minTime));
        let endDate = new Date(eventDate.getTime() + 1000 * 60 * 60);

        if (!spaceOffset) {
            spaceOffset = 5;
        }
        if (timeOffset) {
            startDate = new Date(Math.max(eventDate.getTime() - 1000 * 60 * timeOffset, minTime));
            endDate = new Date(eventDate.getTime() + 1000 * 60 * timeOffset);
        }

        let r = spaceOffset / 6371;

        try {
            let runs = []
            runs = await runModel
                .find({ "eventDate": { "$gte": startDate, "$lte": endDate }, "active": true })
                .find({
                    "from.location": {
                        "$geoWithin": {
                            "$centerSphere": [from.location.coordinates, r]
                        }
                    }
                })
                .find({
                    "to.location": {
                        "$geoWithin": {
                            "$centerSphere": [to.location.coordinates, r]
                        }
                    }
                }).populate('driver')
            res.send(runs)
        } catch (error) {
            console.error(error);
            res.status(500).send()
        }
    },
    getOne: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
                .findOne({ _id })
            if (!run) {
                return res.status(404).send()
            }
            res.send(run);
        } catch (error) {
            res.status(500).send()
        }
    },
    getOneDetails: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
                .findOne({ _id, $or: [{ 'driver': req.user._id }, { 'passengers.passenger': req.user._id }] })

            if (!run) {
                return res.status(401).send()
            }

            res.send(await run.details());
        } catch (error) {
            res.status(500).send()
        }
    },
    validate: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }

        if (!req.body.code) {
            return res.status(400).send()
        }

        try {
            const run = await runModel
                .findOne({ _id, driver: req.user._id })
            if (!run) {
                return res.status(404).send()
            }

            const user = await userModel
                .findOne({ 'validRunCode.code': req.body.code })
            if (!user || user == req.user) {
                return res.status(400).send()
            }

            let timeDifference = Math.abs(Date.now() - user.validRunCode.generatedAt.getTime());
            let timeDifference2 = Math.abs(run.eventDate.getTime() - user.validRunCode.generatedAt.getTime());

            if (timeDifference > 1000 * 60 * 5 || timeDifference2 > 1000 * 60 * 100) {
                return res.status(409).send()
            }

            run.validated.push({ passenger: user._id })

            await run.save()

            res.send({ passenger: user })
        } catch (error) {
            console.log(error);
            res.status(500).send()
        }
    },
    addPassenger: async (req, res) => {
        const _id = req.params.id
        const passengerId = req.params.passengerId

        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }

        if (!ObjectID.isValid(passengerId)) {
            return res.status(404).send();
        }

        try {
            const run = await runModel
                .findOne({ _id: _id, driver: req.user._id })

            if (!run) {
                res.status(404).send();
            }

            const passenger = await userModel
                .findOne({ _id: passengerId })

            if (!passenger) {
                res.status(404).send();
            }

            run.passengers.push({ passenger: passenger.id });

            await run.save()

            res.send(run);
        } catch (error) {
            res.status(400).send();
        }
    },
    removePassenger: async (req, res) => {
        const _id = req.params.id
        const passengerId = req.params.passengerId

        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }

        if (!ObjectID.isValid(passengerId)) {
            return res.status(404).send();
        }

        try {
            const run = await runModel
                .findOne({ _id: _id, driver: req.user._id, 'passengers.passenger': passengerId })

            if (!run) {
                res.status(404).send();
            }

            let toRemove;

            run.passengers.forEach(element => {
                if (element.passenger.equals(passengerId)) {
                    toRemove = element;
                }
            });

            run.passengers.remove(toRemove);

            await run.save()

            res.send(run);
        } catch (error) {
            res.status(400).send();
        }
    },
    leave: async (req, res) => {
        const _id = req.params.id

        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }

        try {
            const run = await runModel
                .findOne({ _id: _id, 'passengers.passenger': req.user._id })

            if (!run) {
                res.status(404).send();
            }

            let toRemove;

            run.passengers.forEach(element => {
                if (element.passenger.equals(req.user._id)) {
                    toRemove = element;
                }
            });

            run.passengers.remove(toRemove);

            await run.save()

            res.send(run);
        } catch (error) {
            res.status(400).send();
        }
    },
    modify: async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["active"]
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates' })
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
                .findOne({ _id: _id, driver: req.user._id })

            if (!run) {
                res.status(404).send();
            }

            updates.forEach((update) => run[update] = req.body[update])
            await run.save()

            res.send(run);
        } catch (error) {
            res.status(400).send();
        }
    },
    remove: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deleterun = await runModel
                .findOneAndDelete({ _id: _id, driver: req.user._id })
            if (!deleterun) {
                return res.status(404).send();
            }
            res.send(deleterun)
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyRun: async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["active"]
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) {
            res.status(400).send({ error: 'Invalid updates' })
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const run = await runModel
                .findOne({ _id: req.params.id })

            if (!run) {
                return res.status(404).send();
            }

            updates.forEach((update) => run[update] = req.body[update])
            await run.save()

            res.send(run);
        } catch (error) {
            res.status(400).send();
        }
    },
    removeRun: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deleterun = await runModel
                .findOneAndDelete({ _id: _id })
            if (!deleterun) {
                return res.status(404).send();
            }
            res.send(deleterun)
        } catch (error) {
            res.status(500).send()
        }
    }
};