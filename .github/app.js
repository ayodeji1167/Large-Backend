require('dotenv').config();
require('express-async-errors');

const express = require('express');

const app = express();

const connectDB = require('./db/connect');

// routers
const apiRouters = require('./src/routes');

// middleware
const notFoundMiddleware = require('./src/middleware/not-found');
const errorHandlerMiddleware = require('./src/middleware/error-handler');

// routes
app.use('/api/v1/', apiRouters);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (e) {
    console.log(e);
  }
};

start();
