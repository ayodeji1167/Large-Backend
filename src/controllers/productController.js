/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */
const appResponse = require('../../lib/appResponse');
const productService = require('../services/productService');
const productsModel = require('../models/productsModel');
const { MESSAGES } = require('../config/constants');
const { uploadToCloud, deleteFromCloud } = require('../config/cloudinary');
const { BadRequestError } = require('../../lib/errors');
const UserModel = require('../models/userModel');
const storeService = require('../services/storeService');
const orderModel = require('../models/productOrderModel');
const sendEmail = require('../utility/email/sendEmail');

class ProductCntrl {
  createProduct = async (req, res) => {
    const { file, body } = req;
    const { _id } = req.user;
    if (!file) throw new BadRequestError('Please Upload an image');

    const { url, public_id } = await uploadToCloud(file.path);
    const store = await storeService.getOneStore({ user: _id });
    if (!store) throw new BadRequestError('Store Not found, cannot Upload products');

    const data = {
      store: store._id,
      image: { publicId: public_id, url },
      ...body,
    };

    const result = await productService.createProduct(data);
    res.status(201).send(appResponse(MESSAGES.CREATED, result));
  };

  getOneProduct = async (req, res) => {
    const result = await productService.findById(req.params.id);
    if (!result) {
      throw new BadRequestError('this product does not exist');
    }
    res.status(200).send(appResponse(MESSAGES.FETCHED, result));
  };

  getAllPrdoucts = async (req, res) => {
    const result = await productService.fetchProducts(req.query);
    res.status(200).send(appResponse(MESSAGES.FETCHED, result));
  };

  editProduct = async (req, res) => {
    const reqData = req.body;

    if (req.file) {
      const { url, public_id } = await uploadToCloud(req.file.path);
      reqData.image = { publicId: public_id, url };
    }

    const result = await productService.edit(req.params.id, req.body);
    if (!result) throw new BadRequestError('Product With This Id was not Found');

    res.status(200).send(appResponse(MESSAGES.UPDATED, result));
  };

  deleteProduct = async (req, res) => {
    const product = await productService.findById(req.params.id);
    if (!product) {
      throw new BadRequestError('this product does not exist');
    }
    deleteFromCloud(product.image.url);
    await productsModel.findByIdAndDelete(req.params.id);

    res.status(200).send(appResponse(MESSAGES.DELETED, null));
  };

  addToCart = async (req, res) => {
    const { productId } = req.params;
    const { user } = req;
    const product = await productService.findById(productId);
    if (!product) {
      throw new BadRequestError('product does not exist');
    }
    const userM = await UserModel.findById(user._id);

    const userCart = await userM.addToCart(product);

    if (userCart) {
      res.status(200).send(appResponse(MESSAGES.UPDATED, userCart.cart));
    }
  };

  removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const { user } = req;

    // eslint-disable-next-line prefer-const
    let userM = await UserModel.findById(user._id);
    const product = await productService.findById(productId);
    if (!product) {
      throw new BadRequestError('product does not exist');
    }
    const removedFromCart = userM.removeFromCart(productId);
    if (!removedFromCart) {
      throw new BadRequestError('could not remove from cart');
    }

    res.status(200).send(appResponse(MESSAGES.DELETED, removedFromCart));
  };

  getCart = async (req, res) => {
    const { user } = req;
    const product = await productService.getCart(user);
    if (!product) {
      throw new BadRequestError('cart not found');
    }
    res.status(200).send(appResponse(MESSAGES.FETCHED, product));
  };

  deleteCartProduct = async (req, res) => {
    const { productId } = req.params;
    const user = await UserModel.findById(req.user.id);
    const removedCartProduct = user.removeFromCart(productId);

    if (removedCartProduct) {
      res.status(200).send(appResponse(MESSAGES.DELETED, 'product deleted'));
    } else {
      throw new BadRequestError('unsuccessful');
    }
  };

  makeOrder = async (req, res) => {
    const { user } = await req;
    const userM = await UserModel.findById(user._id)
      .select(['cart', 'email', '_id']).populate('cart.items.productId');
    // const populatedItems = await userM.populate('cart.items.productId');

    if (!userM) {
      throw new BadRequestError('cannot find cart');
    }

    // eslint-disable-next-line arrow-body-style
    const products = userM.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });

    const userDetails = { email: userM.email, userId: userM._id };
    const order = await productService.createOrder(userDetails, products);
    res.status(200).send(appResponse(MESSAGES.CREATED, order));
  };

  createPaymentToken = async (req, res) => {
    const token = await productService.createUserPaymentToken(req);
    if (token) {
      res.status(200).send(appResponse(MESSAGES.CREATED, token));
    } else {
      throw new BadRequestError('couldn\'t create token');
    }
  };

  chargeCard = async (req, res) => {
    const { orderId } = req.body;
    await productService.chargeCard(req);
    const order = await orderModel.findById(orderId).select(['user', 'payment', 'products']);
    const products = order.products.map((prod) => prod.name);

    // const user = order.user;
    /* eslint-disable prefer-destructuring */
    const email = order.user.email;
    const orderObj = {
      status: order.payment.status,
      totalCost: order.payment.totalCost,
      date: order.payment.date,
      products,
    };

    await req.user.clearCart();
    await sendEmail(email, 'Purchase Successfull', ...orderObj);
    res.status(200).send(appResponse(MESSAGES.UPDATED, 'successful'));
  };
}

module.exports = new ProductCntrl();
