const JobApplicationService = require('../services/jobApplicationService');
const appResponse = require('../../lib/appResponse');
const { MESSAGES } = require('../config/constants');

const { JOB_APP_FETCHED, JOB_APP_CREATED, JOB_APP_DELETED } = MESSAGES;
class JobApplicationCtrl {
  createApplication = async (req, res) => {
    const response = await JobApplicationService.createApplication(req);
    res.status(201).send(appResponse(JOB_APP_CREATED, response));
  };

  findOneApplication = async (req, res) => {
    const response = await JobApplicationService.findOneApplication(req);
    res.status(200).send(appResponse(JOB_APP_FETCHED, response));
  };

  getAllApplications = async (req, res) => {
    const response = await JobApplicationService.getAllApplications(req.query);
    res.status(200).send(appResponse(JOB_APP_FETCHED, response));
  };

  withdrawApplication = async (req, res) => {
    const response = await JobApplicationService.withdrawApplication(req);
    res.status(200).send(appResponse(JOB_APP_DELETED, response));
  };
}

module.exports = new JobApplicationCtrl();
