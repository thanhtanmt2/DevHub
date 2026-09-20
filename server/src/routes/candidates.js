const router = require('express').Router();
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/candidateController');

// Public route — view profile by ID (for employers)
router.get('/:id/public', ctrl.getPublicProfile);

// All routes below require authentication as CANDIDATE
router.use(protect, authorize('CANDIDATE'));

// Profile
router.get('/profile', ctrl.getMyProfile);
router.put('/profile', [
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('github_url').optional().isURL().withMessage('Invalid GitHub URL'),
  body('portfolio_url').optional().isURL().withMessage('Invalid portfolio URL'),
], validate, ctrl.updateProfile);

// Skills
router.get('/skills', ctrl.getMySkills);
router.post('/skills', [
  body('skill_id').isUUID().withMessage('Valid skill_id required'),
  body('level').isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  body('years_of_experience').isFloat({ min: 0 }),
], validate, ctrl.addSkill);
router.put('/skills/:skill_id', [
  body('level').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  body('years_of_experience').optional().isFloat({ min: 0 }),
], validate, ctrl.updateSkill);
router.delete('/skills/:skill_id', ctrl.removeSkill);

// Experiences
router.get('/experiences', ctrl.getExperiences);
router.post('/experiences', [
  body('job_title').notEmpty(),
  body('company_name').notEmpty(),
  body('start_date').isDate(),
], validate, ctrl.addExperience);
router.put('/experiences/:id', ctrl.updateExperience);
router.delete('/experiences/:id', ctrl.deleteExperience);

// Payment info
router.get('/payment-info', ctrl.getPaymentInfo);
router.post('/payment-info', [
  body('account_holder_name').notEmpty(),
  body('bank_name').notEmpty(),
  body('account_number').notEmpty(),
], validate, ctrl.upsertPaymentInfo);

// Workspaces & Payments
router.get('/workspaces', ctrl.getMyWorkspaces);
router.get('/payments', ctrl.getMyPayments);

module.exports = router;
