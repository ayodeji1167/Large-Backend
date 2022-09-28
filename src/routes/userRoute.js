const express = require('express');
const { authenticate, subscriptionAuth } = require('../middleware/auth');
const { Validator } = require('../validators');
const {
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  EditProfileSchema,
  CreateCustomerSchema,
  SubscribeUserSchema,
  ContactUsSchema,
} = require('../validators/userValidator');
const userCtrl = require('../controllers/userController');
const { upload } = require('../config/multer');

const router = express.Router();

router.post('/register', Validator(RegisterSchema, 'body'), userCtrl.register);
router.post('/membership/register', Validator(RegisterSchema, 'body'), userCtrl.temUser);
router.post('/create-stripe-customer', subscriptionAuth, Validator(CreateCustomerSchema, 'body'), userCtrl.createCustomer);
router.post('/subscribe', subscriptionAuth, Validator(SubscribeUserSchema, 'body'), userCtrl.subscribeCustomer);
router.post('/login', userCtrl.login);
router.get('/verify/:token', userCtrl.verifyToken);
router.post('/resendtoken', userCtrl.resendToken);
router.patch('/edit-profile', Validator(EditProfileSchema, 'body'), authenticate, userCtrl.editProfile);
router.post('/edit-profile/:token', userCtrl.modifyEmail);
router.patch('/upload-avatar', upload.single('file'), authenticate, userCtrl.uploadAvatar);
router.delete('/delete-avatar', authenticate, userCtrl.deleteAvatar);
router.post('/upload-voice-over', upload.single('file'), authenticate, userCtrl.uploadVoiceOver);
router.delete('/delete-voice-over', authenticate, userCtrl.deleteVoiceOver);
router.patch('/change-password', authenticate, userCtrl.changePassword);
router.post('/reset-password-mail', Validator(ForgotPasswordSchema, 'body'), userCtrl.resetPasswordMail);
router.get('/reset-token-verification/:resetToken', userCtrl.verifyResetToken);
router.post('/reset-password/:resetToken', Validator(ResetPasswordSchema, 'body'), userCtrl.resetPassword);
router.post('/contact-us', upload.single('file'), Validator(ContactUsSchema, 'body'), userCtrl.contactUs);

module.exports = router;
