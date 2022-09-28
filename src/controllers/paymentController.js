const stripePayment = require('stripe');
const paymentService = require('../services/paymentService');
const appResponse = require('../../lib/appResponse');
const UserService = require('../services/userService');
const constants = require('../config/constants');
const { BadRequestError } = require('../../lib/errors');
const sendMail = require('../utility/email/sendEmail');

const { STRIPE_SECRET_KEY, STRIPE_ENDPOINT_SECRET } = constants;
const stripe = stripePayment(STRIPE_SECRET_KEY);

class PaymentService {
  initailizeSubscription = async (req, res) => {
    const token = await paymentService.initailizeSubscription(req.body);
    return res.status(200).send(appResponse(token));
  };

  createCardToken = async (req, res) => {
    const token = await paymentService.createCardToken(req.body);
    return res.status(200).send(appResponse({ token }));
  };

  chargeCard = async (req, res) => {
    const charged = await paymentService.chargeCardToken(req.body);
    return res.status(200).send(appResponse(charged));
  };

  webhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET);
    } catch (err) {
      throw new BadRequestError(`Webhook Error: ${err.message}`);
    }
    const data = event.data.object;

    // Handle the event
    switch (event.type) {
      case 'charge.succeeded': {
        break;
      }
      case 'invoice.paid': {
        const user = await UserService.findOneUser({ 'subscription.customerId': data.customer });
        user.memberPlan.expireAt = new Date(data.current_period_end);
        user.memberPlan.startTime = new Date(data.current_period_start);
        user.memberPlan.price = data.items.data[0].plan.amount;
        user.subscription.status = 'ACTIVE';
        await user.save();

        break;
      }

      case 'invoice.payment_failed': {
        const user = await UserService.findOneUser({ 'subscription.customerId': data.customer });
        user.subscription.status = 'NOT-ACTIVE';
        user.memberType = 'FREE';
        await user.save();
        const portalUrl = await paymentService.billingPortal(data.customer);
        sendMail(data.latest_invoice.customer_email, 'BBWE Email Invitation', { link: portalUrl });

        break;
      }

      case 'customer.subscription.updated': {
        break;
      }

      case 'customer.subscription.deleted': {
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.send(appResponse({ data }));
  };
}

module.exports = new PaymentService();
