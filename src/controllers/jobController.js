const JobService = require('../services/jobService');
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');
const PaymentService = require('../services/paymentService');

const {
  JOBS_FETCHED, JOB_CREATED, JOB_UPDATED, UPLOADED,
} = MESSAGES;

class JobCtrl {
  createOrder = async (req, res) => {
    const jobDetails = await JobService.createOrder(req);
    res.status(200).send(appResponse('Order Initiated', jobDetails, true));
  };

  generateCardToken = async (req, res) => {
    const token = await PaymentService.createCardToken(req);
    res.status(200).send(appResponse('Token Created', token, true));
  };

  chargeToken = async (req, res) => {
    const charge = await JobService.chargeToken(req.body);
    res.status(200).send(appResponse('Token Charged', charge, true));
  };

  createNew = async (req, res) => {
    const response = await JobService.createJob(req);
    res.status(201).send(appResponse(JOB_CREATED, response));
  };

  uploadCover = async (req, res) => {
    const response = await JobService.uploadCover(req);
    res.status(201).send(appResponse(UPLOADED, response));
  };

  findJobById = async (req, res) => {
    const response = await JobService.findJob(req);
    res.status(200).send(appResponse(JOBS_FETCHED, response));
  };

  showAllJobs = async (req, res) => {
    const response = await JobService.getAllJobs(req.query);
    res.status(200).send(appResponse(JOBS_FETCHED, response));
  };

  updateJob = async (req, res) => {
    const response = await JobService.updateJob(req);
    res.status(200).send(appResponse(JOB_UPDATED, response));
  };

  deleteJob = async (req, res) => {
    const response = await JobService.deleteJob(req);
    res.status(200).send(appResponse(response));
  };
}

module.exports = new JobCtrl();
