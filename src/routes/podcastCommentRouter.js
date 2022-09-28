const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Validator } = require('../validators');
const CommentSchema = require('../validators/commentValidator');
const commentController = require('../controllers/podcastCommentController');
const { IdSchema } = require('../validators/utilValidator');

const router = express.Router();

router.post('/', authenticate, Validator(CommentSchema, 'body'), commentController.createComment);
router.get('/get-all/:podcastId', authenticate, commentController.getAllCommentsPerPost);
router.get('/:id', authenticate, Validator(IdSchema, 'params'), commentController.getOneComment);
router.delete('/:id', authenticate, Validator(IdSchema, 'params'), commentController.deleteComment);

module.exports = router;
