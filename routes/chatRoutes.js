const express = require('express');
const router = new express.Router();

const authenticate = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.get('/chats', authenticate.authUser, chatController.getAll);
router.post('/chats', authenticate.authUser, chatController.create);
router.get('/chats/:id',authenticate.authUser, chatController.getOne);
router.post('/chats/:id/comment',authenticate.authUser, chatController.writeMessage);
router.get('/chats/:id/comment', chatController.getMessagesOfChat);
router.delete('/chats/:id', authenticate.authUser, chatController.remove);
router.get('/chats/admin', authenticate.authAdmin, chatController.getAllChats);
router.get('/chats/admin/:id',authenticate.authAdmin, chatController.getOneChat);
router.delete('/chats/admin/:id', authenticate.authAdmin, chatController.removeChat);

module.exports = router;