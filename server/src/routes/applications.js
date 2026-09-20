const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/applicationController');

router.use(protect);

// Candidate applies
router.post('/', authorize('CANDIDATE'), [
  body('job_post_id').isUUID(),
], validate, ctrl.apply);

// Candidate views their own applications
router.get('/mine', authorize('CANDIDATE'), ctrl.getMyApplications);
router.get('/:id', authorize('CANDIDATE'), ctrl.getApplicationDetail);

module.exports = router;
