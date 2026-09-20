const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/jobController');

// Public routes
router.get('/', ctrl.getJobs);
router.get('/:id', ctrl.getJobById);

module.exports = router;
