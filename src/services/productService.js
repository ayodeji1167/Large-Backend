/* eslint-disable camelcase */
const productModel = require('../models/productsModel');
const orderModel = require('../models/productOrderModel');
const { BadRequestError } = require('../../lib/errors');
const storeModel = require('../models/storeModel');
const UserModel = require('../models/userModel');
const paymentService = require('./paymentService');
const { genRandomPin } = require('../utility/utilizer');

class ProductService {
  findById = async (id) => {
    const product = await productModel.findById(id);
    return product;
  };

  fetchProducts = async (query) => {
    const pageSize = Number(query.pageSize) || 20;
    const pageNo = Number(query.pageNo) || 1;
    const queryObject = {};
    /*
    If there is query by search,
    match the product where either the “name” or “description” contains or matches the search query
    */
    if (query.search) {
      const theSearchRegex = new RegExp(query.search, 'ig');
      queryObject.$or = [
        { name: theSearchRegex },
        { description: theSearchRegex },
      ];
    }
    // If there is a query by name
    if (query.name) {
      queryObject.name = query.name;
    }
    // If there is a query by user
    if (query.store) {
      queryObject.store = query.store;
    }
    const noToSkip = (pageNo - 1) * pageSize;

    const fetched = await productModel
      .find(queryObject)
      .sort({ createdAt: 1 })
      .skip(noToSkip)
      .limit(pageSize)
      .lean();

    const totalCount = await productModel.countDocuments(queryObject);

    const noOfPages = Math.ceil(totalCount / pageSize);

    return {
      fetchedData: fetched,
      noOfPages,
      totalCount,
      pageNo,
      pageSize,
    };
  };

  edit = async (id, body) => {
    const product = await productModel.findByIdAndUpdate(id, body, { new: true });
    return product;
  };

  createProduct = async (data) => {
    const product = await productModel.create(data);
    storeModel.findByIdAndUpdate(
      data.store,
      { $push: { products: product._id } },
      { new: true },
    );
    return product;
  };

  deleteProduct = async (id) => {
    const deletedProduct = await productModel.findByIdAndDelete(id);
    // TODO. delete product from store also
    return deletedProduct;
  };

  getCart = async (user) => {
    const userCart = await UserModel.findById(user._id).populate({ path: 'cart.items.productId', model: 'PRODUCT' });
    const products = userCart.cart.items;
    return products;
  };

  createOrder = async (user, products) => {
    const order = await orderModel.create({
      user,
      products,
    });

    if (!order) {
      throw new BadRequestError('cannot make orders');
    }
    return order;
  };

  createUserPaymentToken = async (req) => {
    const token = await paymentService.createCardToken(req);
    return token;
  };

  chargeCard = async (req) => {
    const { orderId, token } = req.body;

    const order = await orderModel.findById(orderId);
    if (!order) {
      throw new BadRequestError('cannot find an order');
    }
    let price = 0;

    // eslint-disable-next-line array-callback-return
    order.products.map((prod) => {
      price += prod.quantity * prod.product.price;
    });
    const orderObjItem = { description: 'purchase of goods', price };
    const { id } = await paymentService.chargeCardToken(orderObjItem, token);
    const { amount, payment_method_details } = await paymentService.validateCharge(id);

    const paymentId = genRandomPin(6);

    const updateOrderObj = {
      valid: true,
      paymentId,
      'payment.status': 'PAID',
      'payment.totalCost': amount / 100,
      'payment.paymentMethod': payment_method_details.card.brand,
      'payment.date': new Date().toLocaleDateString(),
    };

    const orderObj = await orderModel.findByIdAndUpdate(orderId, updateOrderObj, { new: true });
    return orderObj;
  };
}

module.exports = new ProductService();
