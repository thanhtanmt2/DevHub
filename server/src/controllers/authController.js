const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Role } = require('../models');
const { generateAccessToken, generateRefreshToken, generateRandomToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, role = 'CANDIDATE' } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already in use', 409);

    const validRoles = ['CANDIDATE', 'EMPLOYER'];
    if (!validRoles.includes(role)) throw new AppError('Invalid role', 400);

    const password_hash = await bcrypt.hash(password, 12);
    const email_verify_token = generateRandomToken();

    const user = await User.create({
      email, password_hash, full_name,
      email_verify_token,
      status: 'INACTIVE',
    });

    // Assign role
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (roleRecord) await user.addRole(roleRecord);

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${email_verify_token}`;
    await sendEmail({
      to: email,
      subject: 'DevHub – Xác thực tài khoản của bạn',
      html: `<p>Xin chào <strong>${full_name}</strong>,</p>
             <p>Nhấn vào link bên dưới để xác thực tài khoản:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>Link có hiệu lực trong 24 giờ.</p>`,
    });

    res.status(201).json({
      success: true,
      message: 'Registered successfully. Please check your email to verify your account.',
    });
  } catch (error) { next(error); }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ where: { email_verify_token: token } });
    if (!user) throw new AppError('Invalid or expired verification token', 400);

    await user.update({ email_verified: true, status: 'ACTIVE', email_verify_token: null });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) { next(error); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.status === 'LOCKED') throw new AppError('Account is locked. Contact support.', 403);
    if (!user.email_verified) throw new AppError('Please verify your email first', 401);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ refresh_token: refreshToken });

    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userWithRoles = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }],
    });

    res.json({
      success: true,
      data: { user: userWithRoles, accessToken },
    });
  } catch (error) { next(error); }
};

// POST /api/auth/google
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    // Verify Google Token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user && user.status === 'LOCKED') {
      throw new AppError('Account is locked. Contact support.', 403);
    }
    
    if (!user) {
      // Create new user via Google
      const password_hash = await bcrypt.hash(generateRandomToken(), 12);
      user = await User.create({
        email,
        full_name: name,
        password_hash,
        email_verified: true,
        status: 'ACTIVE'
      });
      // Assign default CANDIDATE role
      const roleRecord = await Role.findOne({ where: { name: 'CANDIDATE' } });
      if (roleRecord) await user.addRole(roleRecord);
    } else if (!user.email_verified) {
      // Auto verify if logging in with Google
      await user.update({ email_verified: true, status: 'ACTIVE' });
    }
    
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    await user.update({ refresh_token: refreshToken });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    const userWithRoles = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }],
    });
    
    res.json({
      success: true,
      data: { user: userWithRoles, accessToken },
    });
  } catch (error) {
    if (error.message.includes('wrong number of segments') || error.message.includes('Token used too late')) {
       next(new AppError('Google login failed', 401));
    } else {
       next(error);
    }
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError('No refresh token', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refresh_token !== token) throw new AppError('Invalid refresh token', 401);

    const newAccessToken = generateAccessToken(user.id);
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) { next(error); }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ where: { refresh_token: token } });
      if (user) await user.update({ refresh_token: null });
    }
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });

    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.update({ reset_password_token: resetToken, reset_password_expires: expires });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'DevHub – Đặt lại mật khẩu',
      html: `<p>Nhấn vào link bên dưới để đặt lại mật khẩu (hiệu lực 1 giờ):</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (error) { next(error); }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ where: { reset_password_token: token } });
    if (!user || user.reset_password_expires < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    const password_hash = await bcrypt.hash(password, 12);
    await user.update({ password_hash, reset_password_token: null, reset_password_expires: null, refresh_token: null });
    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) { next(error); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }],
    });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};
