const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { Validator } = require('../validators');
const { authenticateAdmin } = require('../middleware/auth');

const {
  adminSignUpSchema,
  adminLoginSchema,
} = require('../validators/adminValidator');

router.post(
  '/login',
  Validator(adminLoginSchema),
  adminController.login,
);

router.post(
  '/register',
  authenticateAdmin,
  Validator(adminSignUpSchema),
  adminController.register,
);

router.get(
  '/',
  authenticateAdmin,
  adminController.getAll,
);

router.delete(
  '/:id',
  authenticateAdmin,
  adminController.delete,
);

module.exports = router;
