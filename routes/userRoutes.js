const express = require('express');
const router = new express.Router();

const authenticate  = require('../middleware/auth');
const userController = require('../controllers/userController');

router.post('/users', userController.create);
router.get('/users/me', authenticate.authUser, userController.getMe);
router.get('/users/:id', authenticate.authUser, userController.getOne);
router.get('/users/:id/stats', authenticate.authUser, userController.getStats);
router.patch('/users/me',authenticate.authUser, userController.modifyMe);
router.delete('/users/me', authenticate.authUser, userController.removeMe);
router.post('/users/email', userController.sendEmail);
router.post('/users/activate/:code', userController.activate);
router.post('/users/login', userController.login);
router.post('/users/google', userController.googleLogin);
router.get('/users/me/runs/given', authenticate.authUser, userController.getMyGivenRuns);
router.get('/users/me/runs/received', authenticate.authUser, userController.getMyReceivedRuns);
router.post('/users/code', authenticate.authUser, userController.code);
router.post('/users/logout', authenticate.authUser, userController.logout);
router.post('/users/logoutall', authenticate.authUser, userController.logoutAll);
router.patch('/users/admin/:id', authenticate.authAdmin, userController.modifyUser);
router.delete('/users/admin/:id', authenticate.authAdmin, userController.removeUser);

module.exports = router;