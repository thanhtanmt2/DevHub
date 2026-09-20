const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/workspaceController');

router.use(protect);

// Admin & Workspace Members
router.get('/:id', ctrl.getWorkspaceDetail);

// Admin Only
router.use(authorize('ADMIN'));
router.post('/:id/members', [
  body('candidate_profile_id').isUUID(),
  body('role').optional().isString()
], validate, ctrl.addWorkspaceMember);
router.delete('/:workspaceId/members/:memberId', ctrl.removeWorkspaceMember);

module.exports = router;
