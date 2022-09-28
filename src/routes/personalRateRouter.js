const express = require('express');
const personalRateCtrl = require('../controllers/personalRateCtrl');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, personalRateCtrl.createNew);
router.get('/:id', authenticate, personalRateCtrl.getOne);
router.get('/', authenticate, personalRateCtrl.getAll);
router.patch('/:id', authenticate, personalRateCtrl.edit);
router.delete('/:id', authenticate, personalRateCtrl.delete);

module.exports = router;
