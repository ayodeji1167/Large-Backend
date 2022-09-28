const _ = require('lodash');
const appResponse = require('../../lib/appResponse');
const { BadRequestError, UnauthenticatedError } = require('../../lib/errors');
const adminService = require('../services/adminService');
const { passwordHash, comparePassword, encryptData } = require('../utility/dataCrypto');
const { genRandomPin } = require('../utility/utilizer');
const constants = require('../config/constants');

class AdminController {
  register = async (req, res) => {
    if (req.admin.type !== constants.ADMIN_TYPE) {
      throw new UnauthenticatedError('Admin is not authorized to carry out this operation');
    }

    req.body.email = req.body.email.toLowerCase();
    const existingadmin = await adminService.findByEmail(req.body.email);
    if (existingadmin) { throw new BadRequestError('This email is already registered'); }

    const generatePassword = genRandomPin(10);
    const password = await passwordHash(String(generatePassword));

    const admin = await adminService.create({ ...req.body, password, createdBy: req.admin._id });

    await adminService.sendPasswordMail(admin, generatePassword);
    res.send(
      appResponse('Admin created successfully', _.omit(admin._doc, ['password'])),
    );
  };

  login = async (req, res) => {
    req.body.email = req.body.email.toLowerCase();

    const validAdmin = await adminService.findByEmail(req.body.email);
    if (!validAdmin) throw new UnauthenticatedError('Invalid email or password');

    const validPassword = await comparePassword(
      req.body.password,
      validAdmin.password,
    );
    if (!validPassword) { throw new UnauthenticatedError('Invalid email or password'); }

    const authToken = encryptData({ id: validAdmin._id, email: validAdmin.email });
    const adminData = _.omit(validAdmin._doc, ['password', 'updatedAt', 'type']);
    res.send(
      appResponse('admin login successful', { ...adminData, authToken }),
    );
  };

  getAll = async (req, res) => {
    const admins = await adminService.getAll();

    res.send(appResponse('all admin', admins));
  };

  delete = async (req, res) => {
    if (req.admin.type !== constants.ADMIN_TYPE) { throw new UnauthenticatedError('Admin is not authorized to carry out this operation'); }

    await adminService.delete(req.params.id);
    res.send(appResponse('admin deleted successfully'));
  };
}

module.exports = new AdminController();
