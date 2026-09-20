const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const skillCtrl = require('../controllers/skillController');
const jobCtrl = require('../controllers/jobController');
const appCtrl = require('../controllers/applicationController');
const compCtrl = require('../controllers/companyController');

router.use(protect, authorize('ADMIN'));

// Dashboard placeholder
router.get('/dashboard', (req, res) => res.json({ success: true, message: 'Admin dashboard — Phase 7' }));

// Skills management
router.get('/skills', skillCtrl.getAllSkills);
router.post('/skills', [body('name').notEmpty()], validate, skillCtrl.createSkill);
router.put('/skills/:id', skillCtrl.updateSkill);
router.delete('/skills/:id', skillCtrl.deleteSkill);

// Internal job posts
router.get('/jobs', jobCtrl.getAdminJobs);
router.post('/jobs', [
  body('title').notEmpty(),
  body('description').notEmpty(),
], validate, jobCtrl.createAdminJob);

// Applications for internal jobs
router.get('/jobs/:jobId/applications', appCtrl.getAdminJobApplications);
router.put('/applications/:id/status', [
  body('status').isIn(['PENDING', 'VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED']),
], validate, appCtrl.adminUpdateApplicationStatus);

// Company verification
router.get('/companies', compCtrl.getAllCompanies);
router.put('/companies/:id/verify', [
  body('verification_status').isIn(['VERIFIED', 'REJECTED']),
], validate, compCtrl.verifyCompany);

const wsCtrl = require('../controllers/workspaceController');

// Projects
router.get('/projects', wsCtrl.getProjects);
router.post('/projects', [
  body('name').notEmpty(),
], validate, wsCtrl.createProject);
router.get('/projects/:id', wsCtrl.getProjectById);
router.put('/projects/:id', wsCtrl.updateProject);

module.exports = router;
