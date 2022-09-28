const express = require('express');
const podcastController = require('../controllers/podcastController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/multer');
const { Validator } = require('../validators');
const PodCastSchema = require('../validators/podcastValidator');
const { IdSchema } = require('../validators/utilValidator');

const router = express.Router();

router.post('/create', authenticate, Validator(PodCastSchema, 'body'), upload.single('file'), podcastController.createPodcast);
router.get('/', authenticate, podcastController.getAllPodcasts);
router.put('/:id', authenticate, Validator(IdSchema, 'params'), podcastController.editPodcast);
router.get('/:id', authenticate, Validator(IdSchema, 'params'), podcastController.getOnePodcast);
router.get('/user/:id', authenticate, Validator(IdSchema, 'params'), podcastController.getPodcastsPerUser);
router.delete('/:id', authenticate, Validator(IdSchema, 'params'), podcastController.deletePodcast);

module.exports = router;
