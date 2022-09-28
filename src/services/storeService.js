const { BadRequestError, NotFoundError } = require('../../lib/errors');
const StoreModel = require('../models/storeModel');
const UserModel = require('../models/userModel');
const constants = require('../config/constants');

class ProductService {
  getOneStoreById = async (id) => {
    const Store = await StoreModel.findById(id);
    return Store;
  };

  fetchStores = async (query) => {
    const pageSize = Number(query.pageSize) || 20;
    const pageNo = Number(query.pageNo) || 1;
    const queryObject = {};
    /*
    If there is query by search,
    match the stores where either the “name” or “address” contains or matches the search query
    */
    if (query.search) {
      const theSearchRegex = new RegExp(query.search, 'ig');
      queryObject.$or = [
        { name: theSearchRegex },
        { 'location.address': theSearchRegex },
      ];
    }
    // If there is a query by name
    if (query.name) {
      queryObject.name = query.name;
    }
    // If there is a query by user
    if (query.user) {
      queryObject.user = query.user;
    }

    // If there is a query by location
    if (query.location.city) {
      queryObject.location.city = query.location.city;
    }
    const noToSkip = (pageNo - 1) * pageSize;

    const fetched = await StoreModel
      .find(queryObject)
      .sort({ createdAt: 1 })
      .skip(noToSkip)
      .limit(pageSize)
      .populate({
        path: 'user',
        model: constants.DB_COLLECTION.USER,
        select: {
          password: 0,
          __v: 0,
          memberType: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      })
      .lean();

    const totalCount = await StoreModel.countDocuments(queryObject);

    const noOfPages = Math.ceil(totalCount / pageSize);

    return {
      fetchedData: fetched,
      noOfPages,
      totalCount,
      pageNo,
      pageSize,
    };
  };

  getOneStore = async (data) => {
    const Store = await StoreModel.findOne(data);
    return Store;
  };

  editStore = async (id, data) => {
    const store = await StoreModel.findByIdAndUpdate(id, data, { new: true });
    if (!store) throw new NotFoundError('Store with this Id was Not Found');
    return store;
  };

  createStore = async (data) => {
    const storeExists = await StoreModel.findOne({ name: data.name });
    if (storeExists) throw new BadRequestError('Store with this name already exists');

    const store = await StoreModel.create(data);
    UserModel.findByIdAndUpdate(data.user, { store: store._id });
    return store;
  };
}

module.exports = new ProductService();
