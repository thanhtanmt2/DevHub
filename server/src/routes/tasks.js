const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/taskController');

router.use(protect);

// Workspace tasks routes (nested under workspaces logically, but implemented via path param)
// E.g., /api/tasks/workspace/:workspaceId
router.get('/workspace/:workspaceId', ctrl.getWorkspaceTasks);
router.post('/workspace/:workspaceId', authorize('ADMIN'), [
  body('title').notEmpty()
], validate, ctrl.createTask);

// Task specific routes
router.put('/:id', ctrl.updateTask);
router.post('/:id/submissions', [
  body('submission_url').notEmpty().withMessage('Submission URL is required')
], validate, ctrl.submitTask);
router.get('/:id/submissions', ctrl.getTaskSubmissions);

// Submissions review
router.put('/submissions/:id/review', authorize('ADMIN'), [
  body('status').isIn(['APPROVED', 'REJECTED'])
], validate, ctrl.reviewSubmission);

module.exports = router;
