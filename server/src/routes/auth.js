const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, verifyEmail, resendVerification, login, refresh,
  logout, forgotPassword, resetPassword, getMe, updateAvatar
} = require('../controllers/authController');

router.post('/register', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự'),
  body('full_name').notEmpty().withMessage('Vui lòng nhập họ và tên'),
], validate, register);

router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', [body('email').isEmail().withMessage('Email không hợp lệ')], validate, resendVerification);
router.post('/login', [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
], validate, login);
router.post('/google', [
  body('token').notEmpty().withMessage('Thiếu mã đăng nhập Google')
], validate, require('../controllers/authController').googleLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', [body('email').isEmail().withMessage('Email không hợp lệ')], validate, forgotPassword);
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự'),
], validate, resetPassword);
router.get('/me', protect, getMe);
router.put('/me/avatar', protect, updateAvatar);

module.exports = router;
