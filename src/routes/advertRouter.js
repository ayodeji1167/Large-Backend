const { Router } = require('express');
const advertController = require('../controllers/advertController');
const { upload } = require('../config/multer');
const { authenticate, hasRole } = require('../middleware/auth');

const router = Router();

router.post('/create/order', authenticate, hasRole(['PAID']), advertController.getAdsDetails);
router.post(
  '/create/token',
  authenticate,
  hasRole(['PAID']),
  advertController.createTokenForTheUser,
);
router.post(
  '/charge/token',
  authenticate,
  hasRole(['PAID']),
  advertController.chargeToken,
);

router.post(
  '/create/ads-on-web',

  authenticate,
  hasRole(['PAID']),
  upload.single('file'),
  advertController.createAdvertOnWebsite,
);
router.post(
  '/create/podcast-ad',

  authenticate,
  hasRole(['PAID']),
  upload.array('file'),
  advertController.createPodcastAdvert,
);

// router.post('/create/order', authenticate, advertController.getAdsDetails);
// router.post('/create/token', authenticate, advertController.createTokenForTheUser);
// router.post('/charge/token', authenticate, advertController.chargeToken);
// router.post('/create/ads-on-web', authenticate, upload.single('fil
// e'), advertController.createAdvertOnWebsite);
// router.post('/create/podcast-ad', authenticate, upload.array('file'),
// advertController.createPodcastAdvert);

router.post(
  '/create/tell-us-about-yourself',
  authenticate,
  hasRole(['PAID']),
  upload.single('file'),
  advertController.tellUsAboutYourself.apply,
);

router.post(
  '/create/upload-portfolio/:advertId',
  authenticate,
  hasRole(['PAID']),
  authenticate,
  upload.array('file'),
  advertController.uploadPortFolio,
);

router.post(
  '/create/vid-about-ad/:advertId',

  authenticate,
  hasRole(['PAID']),
  authenticate,
  upload.single('file'),
  advertController.uploadVideoAdvert,
);

router.post(
  '/create/tell-us-about-business',

  authenticate,
  hasRole(['PAID']),
  authenticate,
  upload.single('file'),
  advertController.tellUsAboutYourBusiness,
);
router.get('/:id', authenticate, advertController.getAdvertById);
router.get(
  '/user/:userId',
  authenticate,
  hasRole(['PAID']),
  advertController.getAdvertOfUser,
);
router.delete(
  '/delete/:id',
  authenticate,
  hasRole(['PAID']),
  advertController.deleteAdvert,
);
module.exports = router;
