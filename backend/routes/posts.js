/* this is a routes file for backend where we will store all the routes for backend staring from '/posts'
 */

const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check_auth');
const postController = require('../controllers/postController');
const extractFile = require('../middleware/file');

router.delete('/:id', checkAuth, postController.deletePost);

router.put('/:id', checkAuth, extractFile, postController.updatePost);

router.get('/:id', postController.getPost);

router.post('', checkAuth, extractFile, postController.addPost);

router.use('', postController.getPosts);


module.exports = router;