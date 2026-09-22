const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const jobCtrl = require('../controllers/jobController');
const appCtrl = require('../controllers/applicationController');
const compCtrl = require('../controllers/companyController');
const statsCtrl = require('../controllers/statsController');

router.use(protect, authorize('EMPLOYER'));

// Stats
router.get('/stats', statsCtrl.getEmployerStats);

// Company profile
router.get('/company', compCtrl.getMyCompany);
router.post('/company', [body('name').notEmpty(), body('tax_code').notEmpty(), body('address').notEmpty()], validate, compCtrl.createCompany);
router.put('/company', compCtrl.updateCompany);

// Job posts
router.get('/jobs', jobCtrl.getEmployerJobs);
router.post('/jobs', [body('title').notEmpty(), body('description').notEmpty()], validate, jobCtrl.createEmployerJob);
router.put('/jobs/:id', jobCtrl.updateEmployerJob);
router.delete('/jobs/:id', jobCtrl.closeEmployerJob);

// Applications
router.get('/applications', appCtrl.getAllEmployerApplications);
router.get('/jobs/:jobId/applications', appCtrl.getJobApplications);
router.put('/applications/:id/status', [body('status').isIn(['VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED'])], validate, appCtrl.updateApplicationStatus);

module.exports = router;
