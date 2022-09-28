/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable camelcase */
const path = require('path');
const {
  deleteFromCloud,
  uploadToCloud,
  deleteMultiple,
} = require('../config/cloudinary');
const { BadRequestError } = require('../../lib/errors');
const AdvertModel = require('../models/advertModel');
const OrderModel = require('../models/orderModel');
const PaymentService = require('./paymentService');
const PriceModel = require('../models/priceModel');
const UserModel = require('../models/userModel');
const { UPLOAD_COLLECTIONS } = require('../config/constants');

const { ADVERT_IMAGES, ADVERT_VIDEOS, ADVERT_AUDIOS } = UPLOAD_COLLECTIONS;

class AdvertService {
  getAdsDetails = async (req) => {
    /**
     * get the advert description and the advertiser (userId) from req body
     * Since price varies by location... i get the  location of the user
     * I get the price of the advert correlating with the advertiser Location from DB(PRICE)
     * I create an order object and save to DB with status (not paid) and valid (false)
     * Return the advert object for the front edn to use
     */
    const { description, advertiser } = req.body;
    const { location } = await UserModel.findById(advertiser);
    const { price } = await PriceModel.findOne({
      description,
      continent: location.continent,
    });

    const orderSample = await OrderModel.create({
      description,
      price: Number(price),
      advertiser,
    });
    const orderObj = await OrderModel.populate(orderSample, {
      path: 'advertiser',
      select: ['firstName', 'lastName', 'email', 'location'],
    });

    return orderObj;
  };

  createTokenForTheUser = async (req) => {
    /**
     * TODO Request Validation
     * Get card details of user and create a Stripe token and return to front end
     */

    const token = await PaymentService.createCardToken(req);
    return token;
  };

  chargeToken = async (req) => {
    /**
     * TODO Request Validation
     * Get the order object from the order Id passed in req body
     * pass the token and the advert object(to get the price and  description) to the
     * chargeToken method so as to debit the card ...
     * If it was successful, get the amount and card brand from the response
     * Update the order object to PAID and set the validity to True
     * Return The Order Object as response
     */
    const { orderId, token } = req.body;
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new BadRequestError('Order Not Found');
    }
    console.log('about t b charged');
    const { id } = await PaymentService.chargeCardToken(order, token);
    const { amount, payment_method_details } = await PaymentService.validateCharge(id);
    const updateOrderObj = {
      valid: true,
      'payment.status': 'PAID',
      'payment.totalCost': amount / 100,
      'payment.paymentMethod': payment_method_details.card.brand,
      'payment.date': new Date().toLocaleDateString(),
    };
    const orderObj = await OrderModel.findByIdAndUpdate(
      orderId,
      updateOrderObj,
      { new: true },
    );
    return orderObj;
  };

  checkReqObjectForAds = async (req) => {
    /**
     * Decouples Each Ads Object Out Of The Request Body (Only One Of The Ads Object Will Be Populated)
     * Get The Order From The Body and Check The Order Description
     * If the order description matches one of the ads object, we make sure the ads object is populated
     * If the ads object is not populated , error is thrown
     * If there is a successful check, we return the specific ads object so it can be worked on and saved to DB
     */

    const {
      user, websiteAd, promoteYourself, businessAd, podcastAd, order,
    } = req.body;

    const isOrder = await OrderModel.findById(order);
    if (!isOrder) {
      throw new BadRequestError('Order Not Found');
    }

    if (isOrder.description === 'ADVERTISEMENT ON WEBSITE') {
      if (Object.keys(websiteAd).length === 0) {
        throw new BadRequestError(
          'Please Fill Advert Details For Ads On Website',
        );
      }

      // Implementation For Advertisement On Website
      return { websiteAd, user, order };
    }

    if (isOrder.description === 'PODCAST RECORDING ADVERTISEMENT') {
      if (Object.keys(podcastAd).length === 0) {
        throw new BadRequestError('Please Fill Advert Details For Podcast');
      }
      // Implementation For Podcast Advertisement
      return { podcastAd, user, order };
    }

    if (isOrder.description === 'PROMOTE YOURSELF') {
      if (Object.keys(promoteYourself).length === 0) {
        throw new BadRequestError(
          'Please Fill Advert Details For Promote Yourself',
        );
      }
      // Implementation For Promote Yourself Advertisement
      return { promoteYourself, user, order };
    }

    if (isOrder.description === 'JOB POSTING ADVERTISEMENT') {
      if (Object.keys(businessAd).length === 0) {
        throw new BadRequestError('Please Fill Advert Details For Job Posting');
      }
      // Implementation For Job Posting Advertisement
      return { businessAd, user, order };
    }
    return null;
  };

  advertOnWebsite = async (req) => {
    /**
     * Does a checking of the request Body to make sure the website ad object is populated
     * Validate To Make Sure Title and File Is Present
     * Dynamically assign key because we can either get a video or a picture
     * Save the advert Object
     */
    const { websiteAd, order, user } = await this.checkReqObjectForAds(req);
    const imageFormats = ['.jpeg', '.png', '.jpg'];
    const { file } = req;
    const { title } = websiteAd;
    if (!title) {
      throw new BadRequestError('Please enter ads title');
    }
    if (!file) {
      throw new BadRequestError('Please Upload a file');
    }

    let key;
    let saveFile;
    if (imageFormats.includes(path.extname(file.originalname))) {
      saveFile = await uploadToCloud(file.path, ADVERT_IMAGES);
      key = 'image';
    } else {
      saveFile = await uploadToCloud(file.path, ADVERT_VIDEOS);
      key = 'video';
    }
    const { secure_url, public_id } = saveFile;
    const advert = await AdvertModel.create({
      user,
      order,
      websiteAd: {
        title: websiteAd.title,
        content: websiteAd.content,
        [key]: {
          url: secure_url,
          cloudinaryId: public_id,
        },
      },
    });
    return advert;
  };

  podcastAdvert = async (req) => {
    /**
     * Does a checking to make sure podcast ad object is populated from the req.body
     * Check for the files (image and audio)
     * Save the files to cloudinary and populate the Database
     */
    const { podcastAd, order, user } = await this.checkReqObjectForAds(req);

    const { files } = req;
    const imageFormats = ['.jpeg', '.png', '.jpg'];

    if (!files) {
      throw new BadRequestError('Please Upload a file');
    }
    let imageUrl;
    let imageId;
    let audioUrl;
    let audioId;

    for (const file of files) {
      if (imageFormats.includes(path.extname(file.originalname))) {
        const saveFile = await uploadToCloud(file.path, ADVERT_IMAGES);
        const { secure_url, public_id } = saveFile;
        imageUrl = secure_url;
        imageId = public_id;
        continue;
      }
      const saveFile2 = await uploadToCloud(file.path, ADVERT_AUDIOS);
      const { secure_url, public_id } = saveFile2;
      audioUrl = secure_url;
      audioId = public_id;
    }

    const advert = await AdvertModel.create({
      user,
      order,
      podcastAd: {
        websiteLink: podcastAd.websiteLink,

        audio: {
          url: audioUrl,
          cloudinaryId: audioId,
        },
        image: {
          url: imageUrl,
          cloudinaryId: imageId,
        },
      },
    });
    return advert;
  };

  // PROMOTE YOURSELF ADVERT
  tellUsAboutYourself = async (req) => {
    /**
     * This is the starting point for promote yourself ads where we get the advertiser Details
     * We validate the file and profession to make sure its present
     */
    const { promoteYourself, order, user } = await this.checkReqObjectForAds(
      req,
    );

    const { file } = req;
    const { secure_url, public_id } = await uploadToCloud(
      file.path,
      ADVERT_IMAGES,
    );
    const { profession } = promoteYourself;
    if (!profession) {
      throw new BadRequestError('Please Input Your Profession');
    }
    const advert = await AdvertModel.create({
      user,
      order,
      promoteYourself: {
        profession: promoteYourself.profession,
        professionDescription: promoteYourself.professionDescription,
        skills: promoteYourself.skills,
        image: {
          url: secure_url,
          cloudinaryId: public_id,
        },
      },
    });
    return advert;
  };

  uploadPortfolio = async (req) => {
    /**
     * Get the advert id so as to get the advert we want to populate its portfolio
     * at this point its either (business ad or promote yourslef that neeeds portfolio)
     * we destructure business ads out of the advert and we check if its available
     * If its available, we know its the ads that needs a portfolio so we save the file and dynamicaly assign the keys for portfolio
     * We update the ads  and populate its portfolio fields
     */
    const { advertId } = req.params;
    const advert = await AdvertModel.findById(advertId);
    if (!advert) {
      throw new BadRequestError('Please input a vaid ad');
    }
    let key;
    const { businessAd } = advert;

    businessAd.profession ? (key = 'businessAd') : (key = 'promoteYourself');
    const { files } = req;
    const urls = [];
    const cloudinaryIds = [];
    for (const file of files) {
      const saveFile = await uploadToCloud(file.path, ADVERT_IMAGES);
      const { secure_url, public_id } = saveFile;
      urls.push(secure_url);
      cloudinaryIds.push(public_id);
    }

    const theKey1 = `${key}.portfolio.url`;
    const theKey2 = `${key}.portfolio.cloudinaryId`;

    const updateObject = {
      [theKey1]: urls,
      [theKey2]: cloudinaryIds,
    };

    const newAd = await AdvertModel.findByIdAndUpdate(advertId, updateObject, {
      new: true,
    });
    return newAd;
  };

  uploadVideoAdvert = async (req) => {
    /**
     *  Get the advert id so as to get the advert we want to populate its video field
     *  at this point its either (business ad or promote yourself that neeeds video)
     *  Save the video to DB and dynamically populate the DB
     */
    const { file } = req;
    const { advertId } = req.params;
    const advert = await AdvertModel.findById(advertId);
    if (!advert) {
      throw new BadRequestError('Please input a valid ad');
    }

    let key;
    const { businessAd } = advert;

    businessAd.profession ? (key = 'businessAd') : (key = 'promoteYourself');
    const { secure_url, public_id } = await uploadToCloud(
      file.path,
      ADVERT_VIDEOS,
    );
    const theKey1 = `${key}.video.url`;
    const theKey2 = `${key}.video.cloudinaryId`;
    const updateObject = {
      [theKey1]: secure_url,
      [theKey2]: public_id,
    };

    const newAd = await AdvertModel.findByIdAndUpdate(advertId, updateObject, {
      new: true,
    });
    return newAd;
  };

  // BUSINESS ADVERT
  tellUsAboutYourBusiness = async (req) => {
    /**
     * Does a checking of the request Body to make sure the business ad object is populated
     * Check if the file and profession is available ... throw error if it is not
     * Upload te image and populate  the businessAd object in the DB
     */
    const { businessAd, order, user } = await this.checkReqObjectForAds(req);

    const { file } = req;
    const { profession } = businessAd;
    if (!file) {
      throw new BadRequestError('Please upload a file');
    }
    if (!profession) {
      throw new BadRequestError('Please input what you do');
    }
    const { secure_url, public_id } = await uploadToCloud(
      file.path,
      ADVERT_IMAGES,
    );
    const advert = await AdvertModel.create({
      user,
      order,
      businessAd: {
        profession: businessAd.profession,
        problemStatement: businessAd.problemStatement,
        diffFactor: businessAd.diffFactor,
        reasonToBuy: businessAd.reasonToBuy,
        image: {
          url: secure_url,
          cloudinaryId: public_id,
        },
      },
    });

    return advert;
  };

  getAllAdvertOfUser = async (req) => {
    /**
     * This returns all the advert of a particular user
     */
    const { userId } = req.params;
    const advert = await AdvertModel.find({ user: userId });
    if (!advert) {
      throw new BadRequestError('Advert Not Found');
    }
    return advert;
  };

  getOneAdvert = async (req) => {
    const { id } = req.params;
    const advert = await AdvertModel.findById(id);
    if (!advert) {
      throw new BadRequestError('Advert Not Found');
    }
    return advert;
  };

  deleteAdvert = async (req) => {
    /**
     * Get the advert and deleteBy id (destructure the various ads object out of the advert model)
     * For every advert model, there is just one type of advert thats populated
     * Use the compulsory fields in each ads object to check if the ads is present
     * If one returns true, check for all the files of that particular object and delete all the files
     */
    const { id } = req.params;
    const advert = await AdvertModel.findById(id);
    if (!advert) {
      throw new BadRequestError('Advert Not Found');
    }
    const {
      websiteAd, podcastAd, promoteYourself, businessAd,
    } = await AdvertModel.findByIdAndDelete(id);

    if (websiteAd.title) {
      websiteAd.image.cloudinaryId
        ? await deleteFromCloud(websiteAd.image.cloudinaryId, 'image')
        : await deleteFromCloud(websiteAd.video.cloudinaryId, 'video');
    } else if (podcastAd.audio.url) {
      await deleteFromCloud(podcastAd.audio.cloudinaryId, 'video');
      if (podcastAd.image.url) {
        await deleteFromCloud(podcastAd.image.cloudinaryId, 'image');
      }
    } else if (promoteYourself.profession) {
      await this.deleteFilesForMultiFileAds(promoteYourself);
    } else if (businessAd.profession) {
      await this.deleteFilesForMultiFileAds(businessAd);
    }
  };

  deleteFilesForMultiFileAds = async (promoteYourself) => {
    const imageUrls = [];
    imageUrls.push(promoteYourself.image.cloudinaryId);
    for (const cloudinaryId of promoteYourself.portfolio.cloudinaryId) {
      imageUrls.push(cloudinaryId);
    }
    await deleteMultiple(imageUrls, 'image');
    if (promoteYourself.video.cloudinaryId) {
      await deleteFromCloud(
        promoteYourself.video.cloudinaryId,
        'video',
      );
    }
  };
}

module.exports = new AdvertService();
