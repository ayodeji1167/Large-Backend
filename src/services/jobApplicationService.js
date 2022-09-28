/* eslint-disable camelcase */
const path = require('path');
const JobApplicationModel = require('../models/jobApplicationModel');
const { BadRequestError } = require('../../lib/errors');
const constants = require('../config/constants');
const { uploadToCloud } = require('../config/cloudinary');

const { MESSAGES, UPLOAD_COLLECTIONS } = constants;
const { JOB_RESUMES } = UPLOAD_COLLECTIONS;

class JobApplicationService {
  createApplication = async (req) => {
    const userId = req.user._id;
    const jobId = req.body.job;
    if (!req.file) throw new BadRequestError('Please Upload your Resume');
    const acceptedCVFormats = ['.doc', '.docx', '.pdf'];

    if (!acceptedCVFormats.includes(path.extname(req.file.originalname))) {
      throw new BadRequestError('This file format is not supported.');
    }

    const { secure_url, public_id } = await uploadToCloud(req.file.path, JOB_RESUMES);

    const jobApplication = {
      ...req.body,
      applicant: userId,
      job: jobId,
      cv: {
        url: secure_url,
        publicId: public_id,
      },
    };

    const result = await JobApplicationModel.create(jobApplication);

    return result;
  };

  findOneApplication = async (req) => {
    const jobApplication = await JobApplicationModel.findById(req.params.id).populate({
      path: 'applicant',
      model: constants.DB_COLLECTION.USER,
      select: ['firstName', 'lastName', 'username', 'country'],
    });
    return jobApplication;
  };

  getAllApplications = async (query) => {
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

    // If there is a query by user
    if (query.user) {
      queryObject.user = query.user;
    }

    // If there is a query by country
    if (query.country) {
      queryObject.country = query.country;
    }

    // If there is a query by company
    if (query.company) {
      queryObject.company = query.company;
    }

    // If there is a query by location
    if (query.location) {
      queryObject.location = query.location;
    }

    // If there is a query by createdAt
    if (query.createdAt) {
      queryObject.createdAt = query.createdAt;
    }

    const noToSkip = (pageNo - 1) * pageSize;

    const fetched = await JobApplicationModel
      .find(queryObject)
      .sort({ createdAt: 1 })
      .skip(noToSkip)
      .limit(pageSize)
      .lean();

    const totalCount = await JobApplicationModel.countDocuments(queryObject);

    const noOfPages = Math.ceil(totalCount / pageSize);

    return {
      fetchedData: fetched,
      noOfPages,
      totalCount,
      pageNo,
      pageSize,
    };
  };

  withdrawApplication = async (req) => {
    const { id } = req.params;
    // const { user } = req;

    const applicationToDelete = await JobApplicationModel.findById(id);

    // you should only be able to delete if you posted this particular application.
    // if (applicationToDelete.applicant !== user._id) throw new BadRequestError('Not Allowed');
    if (!applicationToDelete) throw new BadRequestError('Application Does Not Exist!');

    await JobApplicationModel.deleteOne({ _id: id });

    return MESSAGES.JOB_DELETED;
  };
}

module.exports = new JobApplicationService();
