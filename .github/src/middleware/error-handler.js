const { StatusCodes } = require('http-status-codes');
const { CustomAPIError } = require('../../lib/errors');

/* eslint-disable no-unused-vars */
const errorHandlerMiddleware = (err, req, res, next) => {
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Ooops! Something bad happened! We\'re working to fix it',
  };

  if (err instanceof CustomAPIError) {
    return res.status(404).json({ msg: err.message });
  }

  return res.status(customError.statusCode).json({ msg: customError.message });
};

module.exports = errorHandlerMiddleware;
