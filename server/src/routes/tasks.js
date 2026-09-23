const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/taskController');

router.use(protect);

// GET all tasks for a workspace
router.get('/workspace/:workspaceId', ctrl.getWorkspaceTasks);

// GET single task with full details
router.get('/:id', ctrl.getTaskById);

// POST create task (Admin or Manager/Lead — controller handles permission check)
router.post('/workspace/:workspaceId', [body('title').notEmpty()], validate, ctrl.createTask);

// PUT update task (full edit for managers, status-only for members)
router.put('/:id', ctrl.updateTask);

// DELETE task (Admin/Manager only - handled in controller)
router.delete('/:id', ctrl.deleteTask);

// PUT review task → APPROVE or REVISION
router.put('/:id/review', [body('action').isIn(['APPROVE', 'REVISION'])], validate, ctrl.reviewTask);

// Reorder (drag & drop)
router.put('/workspace/:workspaceId/reorder', ctrl.reorderTasks);

// ─── Sub-tasks
router.post('/:id/subtasks', [body('title').notEmpty()], validate, ctrl.addSubTask);
router.put('/:id/subtasks/:subId', ctrl.updateSubTask);
router.delete('/:id/subtasks/:subId', ctrl.deleteSubTask);

// ─── Comments
router.post('/:id/comments', [body('content').notEmpty()], validate, ctrl.addComment);
router.delete('/:id/comments/:commentId', ctrl.deleteComment);

// ─── Legacy compat endpoints
router.post('/:id/submissions', ctrl.submitTask);
router.get('/:id/submissions', ctrl.getTaskSubmissions);
router.put('/submissions/:id/review', authorize('ADMIN'), ctrl.reviewSubmission);

module.exports = router;
