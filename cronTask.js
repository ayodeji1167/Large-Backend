/* eslint-disable max-len */
const cron = require('node-cron');
const moment = require('moment');
const JobOrderModel = require('./src/models/jobPostingOrderModel');
const JobModel = require('./src/models/jobModel');

cron.schedule('0 0 */8 * * *', async () => {
  const jobOrders = await JobOrderModel.find({ expired: false });
  const today = moment().format('YYYY-MM-DD hh:mm:ss');
  if (jobOrders) {
    jobOrders.forEach(async (each) => {
      const eachOrder = each;

      const dueDate = moment(eachOrder.expiresAt).format('YYYY-MM-DD hh:mm:ss');

      if (moment(today).isSameOrAfter(moment(dueDate), 'hours')) {
        eachOrder.expired = true;
        await eachOrder.save();
        await JobModel.findOneAndUpdate({ orderId: eachOrder.orderId }, { valid: false }, { new: true });
      }
    });
  }
});
