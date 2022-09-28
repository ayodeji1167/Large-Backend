/* eslint-disable import/no-unresolved */
const express = require('express');
const jobCtrl = require('../controllers/jobController');
const { authenticate, hasRole } = require('../middleware/auth');
const { Validator } = require('../validators');
const { IdSchema, GenerateTokenSchema } = require('../validators/utilValidator');
const { JobSchema, GetAllJobsSchema, ChargeTokenShema } = require('../validators/jobValidator');
const { upload } = require('../config/multer');

const router = express.Router();
router.post('/create-order', authenticate, hasRole(['RECRUITER']), jobCtrl.createOrder);
router.post('/generate-token', authenticate, hasRole(['RECRUITER']), Validator(GenerateTokenSchema, 'body'), jobCtrl.generateCardToken);
router.post('/charge-token', authenticate, hasRole(['RECRUITER']), Validator(ChargeTokenShema, 'body'), jobCtrl.chargeToken);
router.post('/create', authenticate, hasRole(['RECRUITER']), upload.single('image'), Validator(JobSchema, 'body'), jobCtrl.createNew);
router.put('/upload/:id', authenticate, hasRole(['RECRUITER']), upload.single('image'), jobCtrl.uploadCover);
router.get('/get-one/:id', authenticate, Validator(IdSchema, 'params'), jobCtrl.findJobById);
router.get('/get-all', authenticate, Validator(GetAllJobsSchema, 'query'), jobCtrl.showAllJobs);
router.put('/:id', authenticate, hasRole(['RECRUITER']), Validator(IdSchema, 'params'), jobCtrl.updateJob);
router.delete('/:id', authenticate, hasRole(['RECRUITER']), Validator(IdSchema, 'params'), jobCtrl.deleteJob);

module.exports = router;
