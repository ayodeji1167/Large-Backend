const express = require('express');
const { authenticate } = require('../middleware/auth');
const { Validator } = require('../validators');
const { GenerateTokenSchema, ChargeCardSchema } = require('../validators/paymentValidator');
const paymentCtrl = require('../controllers/paymentController');

const router = express.Router();

router.post('/generate-token', authenticate, Validator(GenerateTokenSchema, 'body'), paymentCtrl.createCardToken);
router.post('/charge-card', authenticate, Validator(ChargeCardSchema, 'body'), paymentCtrl.chargeCard);
router.post('/webhook', paymentCtrl.webhook);
module.exports = router;
