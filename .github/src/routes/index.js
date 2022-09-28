const express = require('express');
const userRouter = require('./userRoute');

const router = express.Router();

function rootRouter() {
  router.use('/user', userRouter());

  return router;
}

module.exports = rootRouter;
