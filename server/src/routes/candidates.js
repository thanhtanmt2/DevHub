const router = require('express').Router();
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/candidateController');

// Không có route công khai xem hồ sơ ứng viên: nhà tuyển dụng xem hồ sơ qua /api/employer/candidates/:id
// (có khóa thông tin liên hệ với doanh nghiệp chưa xác thực)

// All routes below require authentication as CANDIDATE
router.use(protect, authorize('CANDIDATE'));

// Profile
router.get('/profile', ctrl.getMyProfile);
router.put('/profile', [
  body('phone').optional({ checkFalsy: true }).matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/).withMessage('Số điện thoại không hợp lệ (phải là số VN)'),
  body('github_url').optional({ checkFalsy: true }).isURL({ require_protocol: false }).withMessage('Link GitHub không hợp lệ'),
  body('portfolio_url').optional({ checkFalsy: true }).isURL({ require_protocol: false }).withMessage('Link Portfolio không hợp lệ'),
], validate, ctrl.updateProfile);

// Skills
router.get('/skills', ctrl.getMySkills);
router.post('/skills', [
  body('skill_id').isUUID().withMessage('Vui lòng chọn kỹ năng hợp lệ'),
], validate, ctrl.addSkill);
router.delete('/skills/:skill_id', ctrl.removeSkill);

// Experiences
router.get('/experiences', ctrl.getExperiences);
const experienceRules = [
  body('type').optional().isIn(['COMPANY', 'FREELANCE', 'PERSONAL', 'PROJECT']).withMessage('Loại kinh nghiệm không hợp lệ'),
  body('end_date').optional({ nullable: true, checkFalsy: true }).isDate().withMessage('Ngày kết thúc không hợp lệ'),
  body('parent_id').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('Công ty không hợp lệ'),
  body('tasks').optional().isArray({ max: 20 }).withMessage('Danh sách việc đã làm không hợp lệ'),
  body('technologies').optional().isArray({ max: 20 }).withMessage('Danh sách công nghệ không hợp lệ'),
  body('link_url').optional({ nullable: true, checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Link phải bắt đầu bằng http:// hoặc https://'),
];
router.get('/devhub-projects', ctrl.getMyDevhubProjects);
router.post('/experiences', [
  body('job_title').notEmpty(),
  body('company_name').notEmpty(),
  body('start_date').isDate(),
  ...experienceRules,
], validate, ctrl.addExperience);
router.put('/experiences/:id', [
  body('start_date').optional().isDate(),
  ...experienceRules,
], validate, ctrl.updateExperience);
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
router.get('/my-tasks', ctrl.getMyTasks);
router.get('/payments', ctrl.getMyPayments);

// CVs
router.get('/cvs', ctrl.getMyCvs);
router.post('/cvs', [
  body('file_url').notEmpty().withMessage('Thiếu đường dẫn file CV'),
  body('file_name').notEmpty().withMessage('Thiếu tên file CV'),
], validate, ctrl.addCv);
router.put('/cvs/:id/default', ctrl.setDefaultCv);
// Nhập kỹ năng / kinh nghiệm từ CV đã tải lên: parse = AI đọc và trả bản xem trước, import = lưu phần ứng viên đã chọn
const cvImportCtrl = require('../controllers/cvImportController');
router.post('/cvs/import', cvImportCtrl.importFromCv);
router.post('/cvs/:id/parse', cvImportCtrl.parseCv);
router.delete('/cvs/:id', ctrl.deleteCv);

// Việc làm đã lưu (yêu thích): tin tuyển dụng và vị trí dự án thời vụ
const savedCtrl = require('../controllers/savedJobController');
router.get('/saved-jobs/ids', savedCtrl.getSavedIds);
router.get('/saved-jobs', savedCtrl.getSavedJobs);
router.post('/saved-jobs', savedCtrl.saveJob);
router.delete('/saved-jobs/expired', savedCtrl.removeExpired);
router.delete('/saved-jobs/:type/:id', savedCtrl.unsaveJob);

// Project Applications
const projectJobCtrl = require('../controllers/projectJobController');
router.get('/project-applications', projectJobCtrl.getMyProjectApplications);

module.exports = router;
