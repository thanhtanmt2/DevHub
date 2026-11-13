const router = require('express').Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const projectJobCtrl = require('../controllers/projectJobController');

// Public — Cổng thông tin & chấm điểm dành cho Người phỏng vấn qua link share
router.get('/interviewer-portal/:token', projectJobCtrl.getInterviewerPortal);
router.post('/interviewer-portal/:token/applications/:appId/evaluate', projectJobCtrl.submitInterviewerEvaluation);

// Public
router.get('/', optionalAuth, projectJobCtrl.getProjectJobs);
router.get('/:id', projectJobCtrl.getProjectJobById);

// Candidate apply
router.post('/:id/apply', protect, authorize('CANDIDATE'), projectJobCtrl.applyProjectJob);

module.exports = router;
