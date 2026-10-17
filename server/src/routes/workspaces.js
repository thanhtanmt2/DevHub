const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/workspaceController');

router.use(protect);

// Mọi người đã đăng nhập (quyền xem được kiểm tra trong controller: Admin hoặc thành viên Workspace)
router.get('/:id', ctrl.getWorkspaceDetail);
router.get('/:id/stats', ctrl.getWorkspaceStats);

// Nhật ký hoạt động: Admin và Lead (kiểm tra trong controller)
const logCtrl = require('../controllers/activityLogController');
router.get('/:id/logs', logCtrl.getWorkspaceLogs);

// Chỉ Admin (chủ dự án): thêm/xóa thành viên, cử hoặc gỡ Lead
router.use(authorize('ADMIN'));
router.get('/:id/eligible-candidates', ctrl.getEligibleCandidates);
router.post('/:id/members', [
  body('candidate_profile_id').isUUID(),
  body('project_job_id').optional({ nullable: true }).isUUID(),
  body('role').optional().isIn(['LEAD', 'MEMBER'])
], validate, ctrl.addWorkspaceMember);
router.put('/:workspaceId/members/:memberId/role', [
  body('role').isIn(['LEAD', 'MEMBER'])
], validate, ctrl.updateMemberRole);
router.delete('/:workspaceId/members/:memberId', ctrl.removeWorkspaceMember);

module.exports = router;
