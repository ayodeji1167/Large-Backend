/* eslint-disable camelcase */
const appResponse = require('../../lib/appResponse');
const AdvertService = require('../services/advertService');

class AdvertController {
  getAdsDetails = async (req, res) => {
    const adsDetails = await AdvertService.getAdsDetails(req);
    res.status(200).send(appResponse('Order Initiated', adsDetails, true));
  };

  createTokenForTheUser = async (req, res) => {
    const token = await AdvertService.createTokenForTheUser(req);
    res.status(200).send(appResponse('Token Created', token, true));
  };

  chargeToken = async (req, res) => {
    const charge = await AdvertService.chargeToken(req);
    res.status(200).send(appResponse('Token Charged', charge, true));
  };

  createAdvertOnWebsite = async (req, res) => {
    const advert = await AdvertService.advertOnWebsite(req);

    res.status(200).send(appResponse('Advert saved', advert, true));
  };

  createPodcastAdvert = async (req, res) => {
    const advert = await AdvertService.podcastAdvert(req);
    res.status(200).send(appResponse('Advert saved', advert, true));
  };

  tellUsAboutYourself = async (req, res) => {
    const advert = await AdvertService.tellUsAboutYourself(req);
    res.status(200).send(appResponse('Advert saved', advert, true));
  };

  uploadPortFolio = async (req, res) => {
    const advert = await AdvertService.uploadPortfolio(req);
    res.status(200).send(appResponse('Advert saved', advert, true));
  };

  uploadVideoAdvert = async (req, res) => {
    const advert = await AdvertService.uploadVideoAdvert(req);
    res.status(200).send(appResponse('Advert saved', advert, true));
  };

  tellUsAboutYourBusiness = async (req, res) => {
    const advert = await AdvertService.tellUsAboutYourBusiness(req);
    res.status(200).send(appResponse('Advert saved', advert, true));
  };

  getAdvertOfUser = async (req, res) => {
    const advert = await AdvertService.getAllAdvertOfUser(req);
    res.status(200).send(appResponse('successful', advert, true));
  };

  getAdvertById = async (req, res) => {
    const advert = await AdvertService.getOneAdvert(req);
    res.status(200).send(appResponse('successful', advert, true));
  };

  deleteAdvert = async (req, res) => {
    await AdvertService.deleteAdvert(req);

    res.status(200).send(appResponse('Ads Deleted Successfully', null, true));
  };
}
module.exports = new AdvertController();
