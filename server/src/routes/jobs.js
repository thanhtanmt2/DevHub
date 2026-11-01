const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/jobController');
const { optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, ctrl.getJobs);
router.get('/:id', ctrl.getJobById);

module.exports = router;
