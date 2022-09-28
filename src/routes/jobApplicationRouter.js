const express = require('express');
const JobApplicationCtrl = require('../controllers/jobApplicationCtrl');
const { authenticate } = require('../middleware/auth');
const { Validator } = require('../validators');
const { IdSchema } = require('../validators/utilValidator');
const { JobApplicationSchema, GetAllJobsSchema } = require('../validators/jobApplicationValidator');
const { upload } = require('../config/multer');

const router = express.Router();

router.post('/create', authenticate, upload.single('cv'), Validator(JobApplicationSchema, 'body'), JobApplicationCtrl.createApplication);
router.get('/get-one/:id', authenticate, Validator(IdSchema, 'params'), JobApplicationCtrl.findOneApplication);
router.get('/get-all', authenticate, Validator(GetAllJobsSchema, 'query'), JobApplicationCtrl.getAllApplications);
router.delete('/:id', authenticate, Validator(IdSchema, 'params'), JobApplicationCtrl.withdrawApplication);

module.exports = router;
