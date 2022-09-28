const express = require('express');
const userCtrl = require('../controllers/userController');

const { Validator } = require('../validators');
const { RegisterSchema } = require('../validators/userValidator');

const router = express.Router();

router.post('/register', Validator(RegisterSchema, 'body'), userCtrl.register);
router.post('/login', userCtrl.login);

module.exports = router;
