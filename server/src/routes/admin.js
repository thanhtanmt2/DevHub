const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const skillCtrl = require('../controllers/skillController');
const jobCtrl = require('../controllers/jobController');
const appCtrl = require('../controllers/applicationController');
const compCtrl = require('../controllers/companyController');
const wsCtrl = require('../controllers/workspaceController');
const evalCtrl = require('../controllers/evaluationController');
const payCtrl = require('../controllers/paymentController');
const statsCtrl = require('../controllers/statsController');
const userCtrl = require('../controllers/userController');

router.use(protect, authorize('ADMIN'));

// Stats
router.get('/stats', statsCtrl.getAdminStats);

// Users
router.get('/users', userCtrl.getUsers);
router.put('/users/:id/toggle-status', userCtrl.toggleUserStatus);

// Skills
router.get('/skills', skillCtrl.getAllSkills);
router.post('/skills', [body('name').notEmpty()], validate, skillCtrl.createSkill);
router.put('/skills/:id', skillCtrl.updateSkill);
router.delete('/skills/:id', skillCtrl.deleteSkill);

// Jobs
router.get('/jobs', jobCtrl.getAdminJobs);
router.post('/jobs', [body('title').notEmpty(), body('description').notEmpty()], validate, jobCtrl.createAdminJob);

// Applications
router.get('/jobs/:jobId/applications', appCtrl.getAdminJobApplications);
router.put('/applications/:id/status', [body('status').isIn(['PENDING', 'VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED'])], validate, appCtrl.adminUpdateApplicationStatus);

// Companies
router.get('/companies', compCtrl.getAllCompanies);
router.put('/companies/:id/verify', [body('verification_status').isIn(['VERIFIED', 'REJECTED'])], validate, compCtrl.verifyCompany);

// Projects & Workspaces
router.get('/projects', wsCtrl.getProjects);
router.post('/projects', [body('name').notEmpty()], validate, wsCtrl.createProject);
router.get('/projects/:id', wsCtrl.getProjectById);
router.put('/projects/:id', wsCtrl.updateProject);
router.put('/projects/:id/manager', wsCtrl.updateProjectManager);

// Candidates search for admin
const candidateCtrl = require('../controllers/candidateController');
router.get('/candidates/search', candidateCtrl.adminSearchCandidates);

// Project Jobs & Applications
const projectJobCtrl = require('../controllers/projectJobController');
router.get('/projects/:projectId/jobs', projectJobCtrl.adminGetProjectJobs);
router.post('/projects/:projectId/jobs', [body('title').notEmpty()], validate, projectJobCtrl.adminCreateProjectJob);
router.put('/project-applications/:id/status', [body('status').isIn(['REVIEWING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'])], validate, projectJobCtrl.adminUpdateProjectApplicationStatus);
router.post('/project-applications/:id/schedule-interview', [body('interview_time').notEmpty(), body('meet_url').notEmpty()], validate, projectJobCtrl.adminScheduleInterview);

// Evaluations
router.post('/workspaces/:workspaceId/members/:memberId/evaluate', [body('score').isFloat({ min: 0, max: 10 })], validate, evalCtrl.evaluateCandidate);

// Payments
router.get('/payments', payCtrl.getAllPayments);
router.post('/payments', [body('amount').isNumeric(), body('workspace_member_id').isUUID()], validate, payCtrl.createPayment);
router.put('/payments/:id/process', [body('status').isIn(['PROCESSING', 'PAID', 'FAILED'])], validate, payCtrl.processPayment);

module.exports = router;
