// const userService = require("../services/userService")
const appResponse = require('../../lib/appResponse');

class UserCtrl {
  register = async () => {
    appResponse('Register');
  };

  login = async () => {
    appResponse('Login');
  };
}

module.exports = new UserCtrl();
