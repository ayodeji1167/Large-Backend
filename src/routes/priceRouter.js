const express = require('express');
const { Validator } = require('../validators');
const { CreatePriceSchema } = require('../validators/priceValidator');

const priceCtrl = require('../controllers/priceController');
const { authenticateAdmin, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticateAdmin, Validator(CreatePriceSchema, 'body'), priceCtrl.create);
router.get('/all', authenticate, priceCtrl.getAll);
router.put('/edit/:id', authenticateAdmin, priceCtrl.edit);
router.delete('/delete/:id', authenticateAdmin, priceCtrl.delete);

module.exports = router;
