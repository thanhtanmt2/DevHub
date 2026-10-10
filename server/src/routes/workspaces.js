const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/workspaceController');

router.use(protect);

// All authenticated users (Admin + Members)
router.get('/:id', ctrl.getWorkspaceDetail);
router.get('/:id/stats', ctrl.getWorkspaceStats);

// Admin or Manager (quyền kiểm tra trong controller)
router.put('/:workspaceId/members/:memberId/role', [
  body('role').isIn(['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'])
], validate, ctrl.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', ctrl.removeWorkspaceMember);

const logCtrl = require('../controllers/activityLogController');
router.get('/:id/logs', logCtrl.getWorkspaceLogs);

// Admin Only
router.use(authorize('ADMIN'));
router.get('/:id/eligible-candidates', ctrl.getEligibleCandidates);
router.post('/:id/members', [
  body('candidate_profile_id').isUUID(),
  body('project_job_id').optional({ nullable: true }).isUUID(),
  body('role').optional().isIn(['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'])
], validate, ctrl.addWorkspaceMember);

module.exports = router;
