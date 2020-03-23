const express = require('express');
const router = new express.Router();

const authenticate = require('../middleware/auth');
const runController = require('../controllers/runController');

router.post('/runs', authenticate.authUser, runController.create);
router.get('/runs', authenticate.authUser, runController.getAll);
router.get('/runs/:id/details', authenticate.authUser, runController.getOneDetails);
router.get('/runs/:id',authenticate.authUser, runController.getOne);
router.patch('/runs/:id', authenticate.authUser, runController.modify);
router.delete('/runs/:id', authenticate.authUser, runController.remove);
router.patch('/runs/admin/:id', authenticate.authAdmin, runController.modifyRun);
router.delete('/runs/admin/:id', authenticate.authAdmin, runController.removeRun);

module.exports = router;