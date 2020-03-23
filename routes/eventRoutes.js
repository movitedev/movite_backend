const express = require('express');
const router = new express.Router();

const authenticate = require('../middleware/auth');
const eventController = require('../controllers/eventController');

router.post('/events', authenticate.authModerator, eventController.create);
router.get('/events', authenticate.authUser, eventController.getAll);
router.get('/events/:id',authenticate.authUser, eventController.getOne);
router.patch('/events/:id', authenticate.authModerator, eventController.modify);
router.post('/events/:id', authenticate.authUser, eventController.addRun);
router.delete('/events/:id', authenticate.authModerator, eventController.remove);
router.patch('/events/admin/:id', authenticate.authAdmin, eventController.modifyEvent);
router.delete('/events/admin/:id', authenticate.authAdmin, eventController.removeEvent);

module.exports = router;