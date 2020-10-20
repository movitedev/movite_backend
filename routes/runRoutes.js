const express = require('express');
const router = new express.Router();

const authenticate = require('../middleware/auth');
const runController = require('../controllers/runController');

router.post('/runs', authenticate.authUser, runController.create);
router.get('/runs', authenticate.authUser, runController.getAll);
router.post('/runs/search', authenticate.authUser, runController.find);
router.get('/runs/:id/details', authenticate.authUser, runController.getOneDetails);
router.get('/runs/:id', authenticate.authUser, runController.getOne);
router.post('/runs/:id/validate', authenticate.authUser, runController.validate);
router.post('/runs/:id/leave', authenticate.authUser, runController.leave);
router.post('/runs/:id/add/:passengerId', authenticate.authUser, runController.addPassenger);
router.post('/runs/:id/remove/:passengerId', authenticate.authUser, runController.removePassenger);
router.patch('/runs/:id', authenticate.authUser, runController.modify);
router.delete('/runs/:id', authenticate.authUser, runController.remove);
router.patch('/runs/admin/:id', authenticate.authAdmin, runController.modifyRun);
router.delete('/runs/admin/:id', authenticate.authAdmin, runController.removeRun);

module.exports = router;