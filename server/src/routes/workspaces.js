const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/workspaceController');

router.use(protect);

// All authenticated users (Admin + Members)
router.get('/:id', ctrl.getWorkspaceDetail);
router.get('/:id/stats', ctrl.getWorkspaceStats);

// Admin or Manager can update member role
router.put('/:workspaceId/members/:memberId/role', [
  body('role').isIn(['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'])
], validate, ctrl.updateMemberRole);

const logCtrl = require('../controllers/activityLogController');
router.get('/:id/logs', logCtrl.getWorkspaceLogs);

// Admin Only
router.use(authorize('ADMIN'));
router.post('/:id/members', [
  body('candidate_profile_id').isUUID(),
  body('role').optional().isString()
], validate, ctrl.addWorkspaceMember);
router.delete('/:workspaceId/members/:memberId', ctrl.removeWorkspaceMember);

module.exports = router;
