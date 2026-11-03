const router = require('express').Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/forumController');
const social = require('../controllers/forumSocialController');
const messages = require('../controllers/forumMessageController');

// Đọc: ai cũng xem được diễn đàn chung (khách chỉ đọc); diễn đàn dự án tự kiểm tra quyền thành viên trong controller.
// optionalAuth để biết người xem là ai (ẩn người đã bỏ qua, trạng thái theo dõi, đã thích / đã lưu...)
router.get('/overview', optionalAuth, ctrl.getOverview);
router.get('/members/:id', optionalAuth, ctrl.getMember);
router.get('/threads', optionalAuth, ctrl.getThreads);
router.get('/threads/:id', optionalAuth, ctrl.getThread);

// Đăng / trả lời / thích: cần đăng nhập
router.post('/threads', protect, ctrl.createThread);
router.post('/threads/:id/posts', protect, ctrl.createPost);
router.put('/threads/:id', protect, ctrl.updateThread);
router.put('/threads/:id/pin', protect, ctrl.pinThread);
router.put('/threads/:id/lock', protect, ctrl.lockThread);
router.put('/threads/:id/move', protect, authorize('ADMIN'), ctrl.moveThread);
router.put('/posts/:id', protect, ctrl.updatePost);
router.delete('/posts/:id', protect, ctrl.deletePost);
router.post('/posts/:id/like', protect, ctrl.toggleLike);
router.post('/posts/:id/dislike', protect, ctrl.toggleDislike);

// Lưu bài, báo cáo bài vi phạm
router.get('/bookmarks', protect, social.listBookmarks);
router.post('/posts/:id/bookmark', protect, social.toggleBookmark);
router.post('/posts/:id/report', protect, social.createReport);
router.get('/reports', protect, authorize('ADMIN'), social.listReports);
router.put('/reports/:id', protect, authorize('ADMIN'), social.handleReport);

// Theo dõi / bỏ qua thành viên
router.post('/members/:id/follow', protect, social.toggleFollow);
router.post('/members/:id/ignore', protect, social.toggleIgnore);

// Tin nhắn riêng
router.get('/messages/conversations', protect, messages.listConversations);
router.get('/messages/unread-count', protect, messages.unreadCount);
router.get('/messages/with/:userId', protect, messages.getConversation);
router.post('/messages/with/:userId', protect, messages.sendMessage);

// Quản lý chuyên mục: Admin
router.post('/categories', protect, authorize('ADMIN'), ctrl.createCategory);
router.put('/categories/:id', protect, authorize('ADMIN'), ctrl.updateCategory);
router.delete('/categories/:id', protect, authorize('ADMIN'), ctrl.deleteCategory);

module.exports = router;
