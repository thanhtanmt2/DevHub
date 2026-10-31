const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, verifyEmail, resendVerification, login, refresh,
  logout, forgotPassword, resetPassword, getMe, updateAvatar, loginTwoFactor, resendTwoFactor
} = require('../controllers/authController');
const account = require('../controllers/accountController');

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
router.post('/login/2fa', [
  body('challenge').notEmpty().withMessage('Thiếu thông tin xác minh'),
  body('code').notEmpty().withMessage('Vui lòng nhập mã xác minh'),
], validate, loginTwoFactor);
router.post('/login/2fa/resend', [body('challenge').notEmpty().withMessage('Thiếu thông tin xác minh')], validate, resendTwoFactor);
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
router.put('/me/profile', protect, account.updateProfile);
router.put('/me/password', protect, account.changePassword);
router.get('/me/sessions', protect, account.listSessions);
router.delete('/me/sessions', protect, account.revokeSessions);
router.delete('/me/sessions/:id', protect, account.revokeSessions);
router.post('/me/2fa/send-code', protect, account.sendEnableCode);
router.post('/me/2fa/enable', protect, account.enableTwoFactor);
router.post('/me/2fa/disable', protect, account.disableTwoFactor);
router.put('/me/privacy', protect, account.updatePrivacy);

module.exports = router;
