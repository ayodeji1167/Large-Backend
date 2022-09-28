const express = require('express');
const authRouter = require('./userRoute');
const advertRouter = require('./advertRouter');
const jobRouter = require('./jobRouter');
const blogRouter = require('./blogRouter');
const paymentRouter = require('./paymentRoute');
const jobApplicationRouter = require('./jobApplicationRouter');
const priceRouter = require('./priceRouter');
const directMsgRouter = require('./directMsgRoute');
const chatRoomRouter = require('./chatRoomRoute');
const productRouter = require('./productRouter');
const commentRouter = require('./podcastCommentRouter');
const podcastRouter = require('./podcastRouter');
const likeRouter = require('./likeRouter');
const inviteRouter = require('./invitationRoute');
const personalRateRouter = require('./personalRateRouter');
const notificationRouter = require('./notificationRoute');
const storeRouter = require('./storeRouter');
const adminRouter = require('./adminRouter');

const router = express.Router();

function rootRouter() {
  router.use('/user', authRouter);
  router.use('/advert', advertRouter);
  router.use('/job', jobRouter);
  router.use('/blog', blogRouter);
  router.use('/podcast', podcastRouter);
  router.use('/comment', commentRouter);
  router.use('/like', likeRouter);
  router.use('/payment', paymentRouter);
  router.use('/jobApp', jobApplicationRouter);
  router.use('/pricing', priceRouter);
  router.use('/direct-chat', directMsgRouter);
  router.use('/chat-room', chatRoomRouter);
  router.use('/invite', inviteRouter);
  router.use('/notification', notificationRouter);
  router.use('/product', productRouter);
  router.use('/store', storeRouter);
  router.use('/invite', inviteRouter);
  router.use('/admin', adminRouter);
  router.use('/personalRate', personalRateRouter);
  return router;
}

module.exports = rootRouter;
