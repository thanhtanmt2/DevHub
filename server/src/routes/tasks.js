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

// POST create task (Admin hoặc Lead — controller kiểm tra quyền)
router.post('/workspace/:workspaceId', [body('title').notEmpty()], validate, ctrl.createTask);

// PUT update task (Admin/Lead sửa toàn bộ; người được giao cập nhật trạng thái/tiến độ; kéo thả sắp xếp)
router.put('/:id', ctrl.updateTask);

// DELETE task (chỉ Admin/Lead — kiểm tra trong controller)
router.delete('/:id', ctrl.deleteTask);

// PUT review task → APPROVE or REVISION
router.put('/:id/review', [body('action').isIn(['APPROVE', 'REVISION'])], validate, ctrl.reviewTask);

// ─── Sub-tasks
router.post('/:id/subtasks', [body('title').notEmpty()], validate, ctrl.addSubTask);
router.put('/:id/subtasks/:subId', ctrl.updateSubTask);
router.delete('/:id/subtasks/:subId', ctrl.deleteSubTask);

// ─── Comments
router.post('/:id/comments', [body('content').notEmpty()], validate, ctrl.addComment);
router.delete('/:id/comments/:commentId', ctrl.deleteComment);

// ─── Nộp sản phẩm & gửi duyệt (Đang làm → Chờ duyệt), lịch sử các lần nộp
router.post('/:id/submissions', ctrl.submitTask);
router.get('/:id/submissions', ctrl.getTaskSubmissions);

// ─── Legacy compat endpoint
router.put('/submissions/:id/review', authorize('ADMIN'), ctrl.reviewSubmission);

module.exports = router;
