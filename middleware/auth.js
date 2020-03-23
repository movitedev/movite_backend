const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const dotenv = require('dotenv');

dotenv.config();

const authUser = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const user  = await User.findOne({ _id:decoded._id, 'tokens.token': token});

        if(!user){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({error:'You do not have the necessary permissions. Please authenticate!'});
    }
}

const authModerator = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const user  = await User.findOne({ _id:decoded._id, 'tokens.token': token});

        if(!user || user.role=="USER"){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({error:'You do not have the necessary permissions. Please authenticate!'});
    }
}

const authAdmin = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim();
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
       
        const user  = await User.findOne({ _id:decoded._id, 'tokens.token': token});

        if(!user || user.role!="ADMIN"){
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({error:'You do not have the necessary permissions. Please authenticate!'});
    }
}

module.exports = {authUser, authModerator, authAdmin};