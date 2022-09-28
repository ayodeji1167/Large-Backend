const constants = {
  APP_NAME: 'BBWE',
  PORT: process.env.PORT,
  DATABASE_URI: process.env.DATABASE_URI,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
  JWT_USER_LOGIN_EXPIRATION: '2h',

  DB_COLLECTION: {
    USER: 'USER',
    TOKEN: 'TOKEN',
  },

  MESSAGES: {
    USER_EXIST: 'User already exists',
    USER_CREATED: 'User created successfully',
    USER_LOGGED: 'User logged in successfully',
    USER_UPDATED: 'User updated successfully',
    USER_NOT_EXIST: 'User does not exist',
    USER_ACTIVITY_GOTTEN: 'User activities gotten successfully',
    ALREADY_EXIST: 'Resource already exists',
    CREATED: 'Resource created successfully',
    FETCHED: 'Resource fetched',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    NOT_FOUND: 'Not found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid token',
    INVALID_PASSWORD: 'Invalid password',
    TOKEN_VERIFIED: 'Token verified successfully',
    OTP_MESSAGE: 'Hello, your BBWE verification code is',
    OTP_SENT: 'OTP Sent',
    PASSWORD_MISMATCH: 'Password mismatch detected',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
  },
};

module.exports = constants;
