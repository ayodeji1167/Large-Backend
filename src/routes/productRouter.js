const express = require('express');
const productController = require('../controllers/productController');
const { upload } = require('../config/multer');
const {
  ProductSchema, EditProductSchema, FetchProductSchema, ProductIdSchema,
} = require('../validators/productValidator');
const { Validator } = require('../validators');
const { IdSchema } = require('../validators/utilValidator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, upload.single('file'), Validator(ProductSchema, 'body'), productController.createProduct);
router.get('/get-all', authenticate, Validator(FetchProductSchema, 'query'), productController.getAllPrdoucts);
router.get('/:id', authenticate, Validator(IdSchema, 'params'), productController.getOneProduct);
router.patch('/:id', upload.single('file'), authenticate, [Validator(IdSchema, 'params'), Validator(EditProductSchema, 'body')], productController.editProduct);
router.delete('/:id', authenticate, Validator(IdSchema, 'params'), productController.deleteProduct);

// other logic related to cart
router.post('/cart/:productId', authenticate, Validator(ProductIdSchema, 'params'), productController.addToCart);
router.get('/cart/:productId', authenticate, Validator(ProductIdSchema, 'params'), productController.getCart);
router.delete('/cart/:productId', authenticate, Validator(ProductIdSchema, 'params'), productController.removeFromCart);
router.post('/make-order', authenticate, productController.makeOrder);

// payment

router.post('/payment/token', authenticate, productController.createPaymentToken);
router.post('/payment/charge', authenticate, productController.chargeCard);

module.exports = router;
