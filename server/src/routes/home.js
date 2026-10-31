const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');
const ctrl = require('../controllers/homeController');

// Công khai (cá nhân hóa việc làm đề xuất nếu người xem là ứng viên đã đăng nhập)
router.get('/overview', ctrl.getOverview);
router.get('/recommended-jobs', optionalAuth, ctrl.getRecommendedJobs);

module.exports = router;
