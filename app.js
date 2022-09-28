require('dotenv').config();
require('express-async-errors');
const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
require('./cronTask');

const app = express();
const server = require('http').createServer(app);
const socketio = require('./socket/socketConfig');
const rootRouter = require('./src/routes/index');

socketio.getIo(server);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(helmet());

const connectDB = require('./db/connect');

// middleware
const notFoundMiddleware = require('./src/middleware/not-found');
const errorHandlerMiddleware = require('./src/middleware/error-handler');

// routes
app.get('/', (req, res) => {
  res.send('Home Route working');
});

app.use('/api/v1', rootRouter());

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    server.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (e) {
    throw new Error(e);
  }
};

start();
