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
router.get('/dashboard', statsCtrl.getAdminDashboard);

// Users
router.get('/users', userCtrl.getUsers);
const candidateCtrl = require('../controllers/candidateController');
router.get('/candidates', candidateCtrl.searchAdminCandidates);
router.get('/candidates/:id', candidateCtrl.getCandidateForAdmin);
router.post('/candidates/:id/save', candidateCtrl.toggleSaveCandidate);
router.put('/users/:id/toggle-status', userCtrl.toggleUserStatus);
router.put('/users/:id/activate', userCtrl.activateUser);
router.put('/users/:id/role', [require('express-validator').body('role').isIn(['CANDIDATE', 'EMPLOYER', 'ADMIN'])], validate, userCtrl.assignRole);

// Skills
router.get('/skills', skillCtrl.getAllSkills);
router.post('/skills', [body('name').notEmpty()], validate, skillCtrl.createSkill);
router.put('/skills/:id', skillCtrl.updateSkill);
router.delete('/skills/:id', skillCtrl.deleteSkill);

// Jobs
router.get('/jobs', jobCtrl.getAdminJobs);
router.post('/jobs', [body('title').notEmpty(), body('description').notEmpty()], validate, jobCtrl.createAdminJob);
router.put('/jobs/:id/approve', jobCtrl.approveJob);
router.put('/jobs/:id/reject', jobCtrl.rejectJob);

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
router.post('/projects/:id/close', wsCtrl.closeProject);
router.delete('/projects/:id', wsCtrl.deleteProject);
router.post('/projects/:id/workspace', wsCtrl.createProjectWorkspace);

// Project Jobs & Applications
const projectJobCtrl = require('../controllers/projectJobController');
router.get('/projects/:projectId/jobs', projectJobCtrl.adminGetProjectJobs);
router.post('/projects/:projectId/jobs', [body('title').notEmpty()], validate, projectJobCtrl.adminCreateProjectJob);
router.put('/project-jobs/:id', projectJobCtrl.adminUpdateProjectJob);
router.put('/project-applications/:id/status', [body('status').isIn(['REVIEWING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'])], validate, projectJobCtrl.adminUpdateProjectApplicationStatus);
router.post('/project-applications/:id/schedule-interview', [body('interview_time').notEmpty(), body('meet_url').notEmpty()], validate, projectJobCtrl.adminScheduleInterview);
router.get('/interviews', projectJobCtrl.adminGetInterviewSchedule);
router.get('/interviewers', projectJobCtrl.adminGetInterviewers);
router.post('/interviewers', [body('name').notEmpty()], validate, projectJobCtrl.adminCreateInterviewer);
router.put('/interviewers/:id', projectJobCtrl.adminUpdateInterviewer);
router.delete('/interviewers/:id', projectJobCtrl.adminDeleteInterviewer);

// Evaluations
router.post('/workspaces/:workspaceId/members/:memberId/evaluate', [body('score').isFloat({ min: 0, max: 10 })], validate, evalCtrl.evaluateCandidate);
// Chấm điểm cả dự án sau khi đóng dự án: xem danh sách thành viên + điểm hiện có, rồi lưu điểm cho nhiều người một lần
router.get('/projects/:projectId/evaluations', evalCtrl.getProjectEvaluations);
router.post('/projects/:projectId/evaluations', [
  body('evaluations').isArray({ min: 1, max: 100 }),
  body('evaluations.*.member_id').isUUID(),
  body('evaluations.*.score').isFloat({ min: 0, max: 10 }),
  body('evaluations.*.comment').optional({ nullable: true }).isString().isLength({ max: 2000 }),
], validate, evalCtrl.saveProjectEvaluations);

// Payments
router.get('/payments', payCtrl.getAllPayments);
router.get('/payments/members', payCtrl.getPayableMembers);
router.post('/payments', [body('amount').isNumeric(), body('workspace_member_id').isUUID()], validate, payCtrl.createPayment);
router.post('/payments/batch-project', [body('workspace_id').isUUID()], validate, payCtrl.createBatchProjectPayments);
router.put('/payments/:id', [body('amount').isNumeric()], validate, payCtrl.updatePayment);
router.delete('/payments/:id', payCtrl.deletePayment);
router.put('/payments/:id/process', [body('status').isIn(['PAID', 'PENDING'])], validate, payCtrl.processPayment);

// Logs
const logCtrl = require('../controllers/activityLogController');
router.get('/logs', logCtrl.getLogs);

// Export Reports
const exportCtrl = require('../controllers/exportController');
router.get('/export/payments', exportCtrl.exportPaymentsExcel);
router.get('/export/evaluations', exportCtrl.exportEvaluationsExcel);
router.get('/export/applications', exportCtrl.exportApplicationsExcel);

module.exports = router;
