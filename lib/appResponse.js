function formatMessage(objectOrMessage) {
  if (typeof objectOrMessage === 'string') return objectOrMessage;

  if (typeof objectOrMessage === 'object' && objectOrMessage.message) {
    return objectOrMessage.message;
  }

  return '';
}

function createResponse(
  objectOrMessage,
  data = null,
  success = true,
) {
  if (data) {
    return {
      success: success === null ? true : success,
      message: formatMessage(objectOrMessage),
      data,
    };
  }
  return {
    success: success === null ? true : success,
    message: formatMessage(objectOrMessage),
  };
}

module.exports = createResponse;
