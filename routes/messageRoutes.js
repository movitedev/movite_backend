const express = require('express');
const router = new express.Router();

const authenticate = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.post('/messages/:id/removerequest', authenticate.authUser, messageController.removeRequest);

module.exports = router;