const userModel = require('../models/userModel');
const runModel = require('../models/runModel');
const { ObjectID } = require('mongodb');
const verify = require('../social/googleAuth');
const uuidRandom = require('uuid-random');

module.exports = {
    create: async (req, res) => {
        delete req.body.role
        delete req.body.validRunCode
        delete req.body.tokens
        delete req.body.createdAt
        delete req.body.activatedUser
        delete req.body.passwordAccount

        try {
            const sameEmail = await userModel.findOne({ email: req.body.email })
            if (sameEmail) {
                return res.status(409).send()
            }
        } catch (error) {
            return res.status(500).send()
        }

        let user = new userModel(req.body);
        try {

            await user.save()

            const emailCode = await user.newEmailCode()
            let mailOptions = {
                // should be replaced with real recipient's account
                to: user.email,
                subject: 'Movite account verification',
                text: 'Tap the link to verify the account: linkToSite/users/activate/' + emailCode
            };
            require('../mail/mailer')(mailOptions);

            res.status(201).send({ result: 'User created, and email sent to ' + user.email })
        } catch (e) {
            res.status(400).send(e)
        }
    },
    googleLogin: async (req, res) => {

        try {
            var user;
            const googleUser = await verify(req.body.token);
            const sameEmail = await userModel.findOne({ email: googleUser.email })
            if (sameEmail) {
                user = sameEmail
            }
            else {
                let userVal = { name: googleUser.name, email: googleUser.email, password: uuidRandom() };
                user = new userModel(userVal);
                user.passwordAccount = false
            }

            user.activatedUser.active = true
            await user.save()
            const token = await user.newAuthToken()
            console.log(user, token)
            res.send({ user, token })

        } catch (error) {
            console.log(error);

            return res.status(400).send()
        }
    },
    getOne: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const post = await userModel.findOne({ _id })
            if (!post) {
                return res.status(404).send()
            }
            res.send(post);
        } catch (error) {
            res.status(500).send()
        }
    },
    getStats: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {

            let stats = {};

            let driverNumber = await runModel.countDocuments({ driver: _id });
            let passengerNumber = await runModel.countDocuments({ 'passengers.passenger': _id });

            stats.driverNumber = driverNumber;
            stats.passengerNumber = passengerNumber;

            res.send(stats);
        } catch (error) {
            res.status(500).send()
        }
    },
    getMe: async (req, res) => {
        res.send(req.user)
    },
    getMyGivenRuns: async (req, res) => {
        try {
            const user = await userModel.findOne({ _id: req.user._id })
            if (!user) {
                return res.status(404).send()
            }
            await user.populate('givenRuns').execPopulate()
            res.send(user.givenRuns)
        } catch (error) {
            res.status(500).send()
        }
    },
    getMyReceivedRuns: async (req, res) => {
        try {
            const user = await userModel.findOne({ _id: req.user._id })
            if (!user) {
                return res.status(404).send()
            }
            await user.populate('receivedRuns').execPopulate()
            res.send(user.receivedRuns)
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyMe: async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ["name", "password", "age", "home", "passwordAccount"]
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        const _id = req.user._id

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid request' })
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
    removeMe: async (req, res) => {
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
    login: async (req, res) => {
        try {
            const user = await userModel.checkValidCredentials(req.body.email, req.body.password)
            if (user.activatedUser.active && user.passwordAccount) {
                const token = await user.newAuthToken()
                console.log(user, token)
                res.send({ user, token })
            }
            else if (!user.activatedUser.active) {
                return res.status(401).send({ error: 'User not activated' })
            }
            else {
                return res.status(409).send({ error: 'User logged only with social login' })
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({ error })
        }
    },
    code: async (req, res) => {
        if (!ObjectID.isValid(req.user._id)) {
            return res.status(404).send();
        }
        try {
            const validRunCode = await req.user.newValidRunCode()
            console.log(validRunCode)
            res.send({ validRunCode: validRunCode })
        } catch (error) {
            res.status(400).send()
        }
    },
    activate: async (req, res) => {
        const user = await userModel.findOne({ 'activatedUser.code': req.params.code })
        if (!user) {
            return res.status(404).send();
        }
        try {
            user.activatedUser.active = true
            await user.save()
            res.send(req.user);
        } catch (error) {
            res.status(400).send()
        }
    },
    sendEmail: async (req, res) => {
        const user = await userModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).send();
        }
        try {
            const emailCode = await user.newEmailCode()

            let mailOptions = {
                // should be replaced with real recipient's account
                to: req.body.email,
                subject: 'Movite account verification',
                text: 'Tap the link to verify the account: linkToSite/users/activate/' + emailCode
            };

            require('../mail/mailer')(mailOptions);

            res.send({ response: "Mail sent to " + req.body.email })
        } catch (error) {
            res.status(400).send()
        }
    },
    logout: async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    },
    logoutAll: async (req, res) => {
        try {
            req.user.tokens = []
            await req.user.save()
            res.send()
        } catch (error) {
            res.status(500).send()
        }
    },
    modifyUser: async (req, res) => {
        const _id = req.params.id
        const updates = Object.keys(req.body);
        const allowedUpdates = ["name", "age", "home", "role"]
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates' })
        }
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const user = await userModel.findOne({ _id: req.params.id })

            if (!user) {
                return res.status(404).send();
            }

            updates.forEach((update) => user[update] = req.body[update])
            await user.save()

            res.send(user);
        } catch (error) {
            res.status(400).send();
        }
    },
    removeUser: async (req, res) => {
        const _id = req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const deleteuser = await userModel.findOneAndDelete({ _id: _id })
            if (!deleteuser) {
                return res.status(404).send();
            }
            res.send(deleteuser)
        } catch (error) {
            res.status(500).send()
        }
    }
}