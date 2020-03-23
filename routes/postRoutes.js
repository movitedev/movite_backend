const express = require('express');
const router = new express.Router();

const authenticate = require('../middleware/auth');
const postController = require('../controllers/postController');

router.post('/posts', authenticate.authUser, postController.create);
router.get('/posts', postController.getAll);
router.get('/posts/:id',authenticate.authUser, postController.getOne);
router.post('/posts/:id/comment',authenticate.authUser, postController.comment);
router.get('/posts/:id/comment', postController.getCommentsOfPost);
router.patch('/posts/:id', authenticate.authUser, postController.modify);
router.delete('/posts/:id', authenticate.authUser, postController.remove);
router.patch('/posts/admin/:id', authenticate.authAdmin, postController.modifyPost);
router.delete('/posts/admin/:id', authenticate.authAdmin, postController.removePost);

module.exports = router;