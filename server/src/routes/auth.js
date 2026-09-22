const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register, verifyEmail, login, refresh,
  logout, forgotPassword, resetPassword, getMe
} = require('../controllers/authController');

router.post('/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('full_name').notEmpty().withMessage('Full name is required'),
], validate, register);

router.get('/verify-email/:token', verifyEmail);
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], validate, login);
router.post('/google', [
  body('token').notEmpty().withMessage('Token is required')
], validate, require('../controllers/authController').googleLogin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', [body('email').isEmail()], validate, forgotPassword);
router.post('/reset-password/:token', [
  body('password').isLength({ min: 8 }),
], validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
