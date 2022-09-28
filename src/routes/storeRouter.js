const express = require('express');
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/multer');
const { Validator } = require('../validators');
const { StoreSchema, FetchStoreSchema, EditStoreSchema } = require('../validators/storeValidator');
const { IdSchema } = require('../validators/utilValidator');

const router = express.Router();

router.post(
  '/',
  authenticate,
  upload.single('logo'),
  Validator(StoreSchema, 'body'),
  storeController.createStore,
);
router.get('/', authenticate, Validator(FetchStoreSchema, 'query'), storeController.fetchStores);
router.get('/:id', authenticate, Validator(IdSchema, 'params'), storeController.getOneStore);
router.patch('/:id', authenticate, [Validator(IdSchema, 'params'), Validator(EditStoreSchema, 'body')], storeController.editStore);

module.exports = router;
