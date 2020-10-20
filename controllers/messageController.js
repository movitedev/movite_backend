const messageModel = require('../models/messageModel');
const {ObjectID} = require('mongodb');

module.exports = {
    removeRequest : async (req,res) => {
        const _id =  req.params.id
        if (!ObjectID.isValid(_id)) {
            return res.status(404).send();
        }
        try {
            const message = await messageModel.findOne({ _id}).populate('chatId')
            if(!message){
                return res.status(404).send()
            }
            
            let ok = false;

            for(let elem of message.chatId.partecipants){
                if(elem.partecipant.equals(req.user._id)){
                    ok = true;
                }
            }


            if(!ok){
                return res.status(404).send()
            }

            message.activeRequest = false;
            
            await message.save()
            res.send(message);
        } catch (error) {
            res.status(500).send()
        }
    }
};