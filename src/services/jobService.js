/* eslint-disable camelcase */
const path = require('path');
const JobModel = require('../models/jobModel');
const JobOrderModel = require('../models/jobPostingOrderModel');
const { BadRequestError, NotFoundError } = require('../../lib/errors');
const constants = require('../config/constants');
const { uploadToCloud, deleteFromCloud } = require('../config/cloudinary');
const PriceModel = require('../models/priceModel');
const paymentService = require('./paymentService');
const { genRandomPin } = require('../utility/utilizer');

const { MESSAGES, UPLOAD_COLLECTIONS, RESOURCE_TYPE } = constants;
const { JOB_COVERS } = UPLOAD_COLLECTIONS;

class JobService {
  createOrder = async (req) => {
    /**
     * TODO Request Validation
     * get the Job description and the recruiter(userId) from req
     * I create an order object and save to Job Order DB with status (not paid) and valid (false)
     * Return the advert object for the front edn to use
     */

    const { _id } = req.user;

    const priceDetails = await PriceModel.findOne({ description: 'JOB POSTING' });
    if (!priceDetails) throw new NotFoundError('Job price is not found');

    const orderSample = await JobOrderModel.create({
      description: priceDetails.description,
      price: priceDetails.price,
      recruiter: _id,
    });
    const orderObj = await JobOrderModel.populate(orderSample, {
      path: 'recruiter',
      select: ['firstName', 'lastName', 'email', 'location'],
    });

    return orderObj;
  };

  chargeToken = async (data) => {
    /**
     * TODO Request Validation
     * Get the order object from the order Id passed in req body
     * pass the token and the advert object(to get the price and  description) to the
     * chargeToken method so as to debit the card ...
     * If it was successful, get the amount and card brand from the response
     * Update the order object to PAID and set the validity to True
     * Return The Order Object as response
     */
    const { jobOrderId, token } = data;
    const order = await JobOrderModel.findById(jobOrderId);
    if (!order) {
      throw new BadRequestError('Order Not Found');
    }
    const { id } = await paymentService.chargeCardToken(order, token);
    const { amount, payment_method_details } = await paymentService.validateCharge(id);
    const randomId = genRandomPin(6);
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    // console.log(date);

    const updateOrderObj = {
      orderId: `BBWE${randomId}`,
      valid: true,
      'payment.status': 'PAID',
      'payment.totalCost': amount / 100,
      'payment.paymentMethod': payment_method_details.card.brand,
      expiresAt: date,
    };
    const orderObj = await JobOrderModel.findByIdAndUpdate(
      jobOrderId,
      updateOrderObj,
      { new: true },
    );

    // await paymentService.updateCharge(id, `BBWE${randomId}`)

    return orderObj;
  };

  createJob = async (req) => {
    const { _id } = req.user;
    const { file } = req;
    const imageFormats = ['.jpeg', '.png', '.jpg'];

    const order = await JobOrderModel.findOne({ orderId: req.body.orderId, valid: true });
    if (!order) throw new BadRequestError('Please Pay for Job Posting Service');

    let uploadedFile;
    let url;
    let publicId;
    if (file) {
      if (imageFormats.includes(path.extname(file.originalname))) {
        uploadedFile = await uploadToCloud(file.path, JOB_COVERS);
        url = uploadedFile.secure_url;
        publicId = uploadedFile.public_id;
      } else throw new BadRequestError('File format not supported.');
    }

    const job = await JobModel.create({
      ...req.body,
      recruiter: _id,
      valid: true,
      cover_image: {
        url,
        publicId,
      },
    });

    order.valid = false;

    await order.save();

    return job;
  };

  uploadCover = async (req) => {
    const { file } = req;
    const imageFormats = ['.jpeg', '.png', '.jpg'];
    if (!file) throw new BadRequestError('Please Upload an image');

    if (!imageFormats.includes(path.extname(file.originalname))) {
      throw new BadRequestError('File format not supported.');
    }

    const job = await JobModel.findById(req.params.id);

    const { secure_url, public_id } = await uploadToCloud(file.path, JOB_COVERS);
    job.cover_image.url = secure_url;
    job.cover_image.publicId = public_id;

    await job.save();

    return job;
  };

  findJob = async (req) => {
    const job = await JobModel.findById(req.params.id).populate({
      path: 'recruiter',
      model: constants.DB_COLLECTION.USER,
      select: {
        password: 0,
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    });

    if (!job) throw new BadRequestError("Job doesn't exist");

    return job;
  };

  getAllJobs = async (query) => {
    const pageSize = Number(query.pageSize) || 20;
    const pageNo = Number(query.pageNo) || 1;

    const queryObject = {};

    /*
    If there is query by search,
    match the jobs where either the “title” or “description” contains or matches the search query
    */
    if (query.search) {
      const theSearchRegex = new RegExp(query.search, 'ig');
      queryObject.$or = [
        { title: theSearchRegex },
        { description: theSearchRegex },
      ];
    }
    // If there is a query by title
    if (query.title) {
      queryObject.title = query.title;
    }
    // If there is a query by company
    if (query.company) {
      queryObject.company = query.company;
    }

    // If there is a query by location
    if (query.location) {
      queryObject.location = query.location;
    }

    // If there is a query by availability
    if (query.availability) {
      queryObject.availability = query.availability;
    }

    // If there is a query by createdAt
    if (query.createdAt) {
      queryObject.createdAt = query.createdAt;
    }

    // If there is a query by recruiter
    if (query.recruiter) {
      queryObject.recruiter = query.recruiter;
    }

    const noToSkip = (pageNo - 1) * pageSize;

    const fetched = await JobModel
      .find(queryObject)
      .sort({ createdAt: 1 })
      .skip(noToSkip)
      .limit(pageSize)
      .populate({
        path: 'recruiter',
        model: constants.DB_COLLECTION.USER,
        select: {
          password: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      })
      .lean();

    const totalCount = await JobModel.countDocuments(queryObject);

    const noOfPages = Math.ceil(totalCount / pageSize);

    return {
      fetchedData: fetched,
      noOfPages,
      totalCount,
      pageNo,
      pageSize,
    };
  };

  updateJob = async (req) => {
    const { id } = req.params;

    if (!req.body) throw new BadRequestError('Cannot update empty data.');

    const updatedJob = await JobModel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedJob) throw new BadRequestError('Job not Found!');

    return { updatedJob };
  };

  deleteJob = async (req) => {
    const { id } = req.params;
    const jobToDelete = await JobModel.findById(id);

    if (!jobToDelete) throw new BadRequestError('Job Does Not Exist!');
    const { publicId } = jobToDelete.cover_image;

    let publicIdToDelete;
    if (publicId) {
      publicIdToDelete = jobToDelete.cover_image.publicId;
      await deleteFromCloud(publicIdToDelete, RESOURCE_TYPE.IMAGE);
    }

    await JobModel.deleteOne({ _id: id });
    return MESSAGES.JOB_DELETED;
  };
}

module.exports = new JobService();
