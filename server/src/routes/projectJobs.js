const router = require('express').Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const projectJobCtrl = require('../controllers/projectJobController');

// Public
router.get('/', optionalAuth, projectJobCtrl.getProjectJobs);
router.get('/:id', projectJobCtrl.getProjectJobById);

// Candidate apply
router.post('/:id/apply', protect, authorize('CANDIDATE'), projectJobCtrl.applyProjectJob);

module.exports = router;
