const express = require('express');
const { upload } = require('../config/multer');
const {
  createNew, edit, deleteResource, getAll, getOne,
} = require('../controllers/blogController');
const blogCommentController = require('../controllers/blogCommentController');
const { Validator } = require('../validators');
const { authenticate } = require('../middleware/auth');
const {
  blogValidator, blogEditValidator, blogCommentValidator, blogQueryValidator,
} = require('../validators/blogValidator');

const router = express.Router();
// comments
router.post('/comment', authenticate, Validator(blogCommentValidator, 'body'), blogCommentController.createComment);
router.get('/comment/single/:commentId', authenticate, blogCommentController.getOneComment);
router.patch('/comment', authenticate, blogCommentController.updateComment);
router.delete('/comment/:commentId', authenticate, blogCommentController.deleteComment);
router.get('/comment/all', authenticate, Validator(blogQueryValidator, 'query'), blogCommentController.getAllComments);

// remember to authenticate
router.post('/', upload.single('file'), authenticate, Validator(blogValidator, 'body'), createNew);
router.patch('/:id', authenticate, Validator(blogEditValidator, 'body'), edit);
router.delete('/:id', authenticate, deleteResource);
router.get('/:id', getAll);
router.get('/single/:id', getOne);

const blogRouter = router;
module.exports = blogRouter;
