const express = require('express');
const { authenticate } = require('../middleware/auth');
const likeController = require('../controllers/likeController');

const router = express.Router();

router.post('/:podcastId', authenticate, likeController.like);
router.get('/all/:podcastId', authenticate, likeController.getAllLikesPerPost);
router.delete('/:podcastId/unlike', authenticate, likeController.disLike);

module.exports = router;
