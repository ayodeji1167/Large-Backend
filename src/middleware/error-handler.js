const { StatusCodes } = require('http-status-codes');
const { CustomAPIError } = require('../../lib/errors');

/* eslint-disable no-unused-vars */
const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      err.message || "Ooops! Something bad happened! We're working to fix it",
  };

  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.code === 'EAUTH') {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'email server login or password is incorrect.' });
  }

  return res
    .status(customError.statusCode)
    .json({ message: customError.message });
};

module.exports = errorHandlerMiddleware;
