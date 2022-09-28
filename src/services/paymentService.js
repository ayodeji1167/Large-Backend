const stripePayment = require('stripe');
const { BadRequestError } = require('../../lib/errors');
const NotFound = require('../../lib/errors/not-found');
const constants = require('../config/constants');
const PriceModel = require('../models/priceModel');
const { genRandomPin } = require('../utility/utilizer');
const userService = require('./userService');

const { STRIPE_SECRET_KEY } = constants;
const stripe = stripePayment(STRIPE_SECRET_KEY);

class PaymentService {
  initailizeSubscription = async (price) => {
    const session = await stripe.checkout.sessions.create({
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      line_items: [
        {
          // Provide the exact Price ID of the product you want to sell
          price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });

    return session;
  };

  createCardToken = async (req) => {
    const data = req.body;
    const token = await stripe.tokens.create({
      card: {
        number: data.cardNumber,
        exp_month: data.expMonth,
        exp_year: data.expYear,
        cvc: data.cvc,
      },
    });
    return token;
  };

  chargeCardToken = async (order, token) => {
    // TODO get amount from product using the productId to perform a findById func
    // get description from product as well
    console.log(order);
    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'usd',
      source: token,
      description: order.description,
    });

    return charge;
  };

  /* You can call this function in the middleware
 @params chargeId
 */
  validateCharge = async (chargeId) => {
    const chargeDetails = await stripe.charges.retrieve(chargeId);
    if (!chargeDetails.paid) throw new BadRequestError('Payment was not successful');

    return chargeDetails;
  };

  updateCharge = async (id, orderId) => {
    const charge = await stripe.charges.update(id, { metadata: { order_id: orderId } });
    return charge;
  };

  billingPortal = async (customer) => {
  // TODO
  // supply a valid rturn url
    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: 'https://example.com/success',
    });
    return session.url;
  };

  // Membership Subscription Plan
  createCustomer = async (req) => {
    const { email } = req.user;
    const token = await this.createCardToken(req);

    const customer = await stripe.customers.create({
      source: token.id,
      email,
    });

    return { customerId: customer.id };
  };

  subscribeCustomer = async (user) => {
    const { memberType } = user;
    let newUser;
    const product = await PriceModel.findOne({ description: memberType });
    if (!product) throw new NotFound('product price was not found');

    const subscription = await stripe.subscriptions.create({
      customer: user.customerId,
      items: [{ price: 'price_1LO3dNBrE8cFFrypp9Pyly5o' }],
      expand: ['latest_invoice.payment_intent'],
    });
    if (subscription.items.data[0].plan.active === true) {
      const randomId = genRandomPin(6);
      const startTime = new Date(subscription.current_period_start);
      const endTime = new Date(subscription.current_period_end);
      const price = subscription.items.data[0].plan.amount;
      const data = {
        ...user,
        'subscription.status': 'ACTIVE',
        'subscription.customerId': user.customerId,
        'memberPlan.expireAt': endTime,
        'membeerPlan.startTime': startTime,
        'memberPlan.price': price,
        orderId: `BBWE${randomId}`,
        'subscription.id': subscription.id,

      };
      newUser = await userService.register(data);
    }
    return newUser;
  };
}

module.exports = new PaymentService();
