const appResponse = require('../../lib/appResponse');
const storeService = require('../services/storeService');
const { MESSAGES } = require('../config/constants');
const { BadRequestError, NotFoundError } = require('../../lib/errors');
const { uploadToCloud } = require('../config/cloudinary');

const { CREATED, FETCHED } = MESSAGES;

class StoreController {
  createStore = async (req, res) => {
    const data = req.body;
    const { _id, location } = req.user;
    const { file } = req;

    if (!file) throw new BadRequestError('Please Supply a logo file');

    const uploadedImage = await uploadToCloud(file.path);
    const logo = {
      publicId: uploadedImage.public_id,
      url: uploadedImage.url,
    };

    data.logo = logo;
    data.user = _id;
    data.location = {
      address: data.address,
      country: location.country,
      city: data.city,
    };
    const response = await storeService.createStore(data);

    res.status(201).send(appResponse(CREATED, response));
  };

  getOneStore = async (req, res) => {
    const store = await storeService.getOneStore(req.params.id);
    if (!store) throw new NotFoundError('Store with this Id was Not Found');
    res.status(200).send(appResponse(FETCHED, store));
  };

  editStore = async (req, res) => {
    const reqData = req.body;
    const { file } = req;

    if (file) {
      const uploadedImage = await uploadToCloud(file);
      const logo = {
        publicId: uploadedImage.public_id,
        url: uploadedImage.url,
      };
      reqData.logo = logo;
    }

    if (reqData.name) {
      const store = await storeService.getOneStore({ name: reqData.name });
      if (store) throw new BadRequestError('Choose Another Name, Store Name is Taken Already');
    }
    const stores = await storeService.editStore(req.params.id, reqData);
    res.status(200).send(appResponse(FETCHED, stores));
  };

  fetchStores = async (req, res) => {
    const stores = await storeService.fetchStores(req.query);
    res.status(200).send(appResponse(FETCHED, stores));
  };
}

module.exports = new StoreController();
