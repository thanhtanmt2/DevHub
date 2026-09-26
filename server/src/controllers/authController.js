const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Role } = require('../models');
const { generateAccessToken, generateRefreshToken, generateRandomToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { logActivity } = require('../utils/activityLogger');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

// POST /api/auth/register
// Đăng ký tài khoản mới
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, role = 'CANDIDATE' } = req.body;

    // kiểm tra xem email đã tồn tại chưa 
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new AppError('Email already in use', 409);

    // kiểm tra xem vai trò có hợp lệ không 
    const validRoles = ['CANDIDATE', 'EMPLOYER'];
    if (!validRoles.includes(role)) throw new AppError('Invalid role', 400);
    // mã hóa mật khẩu
    const password_hash = await bcrypt.hash(password, 12);
    // tạo mã xác thực email thư viện crypto 64 ký tự 
    const email_verify_token = generateRandomToken();

    // tạo user 
    const user = await User.create({
      email, password_hash, full_name,
      email_verify_token,
      status: 'INACTIVE',
    });

    // tìm vai trò 
    const roleRecord = await Role.findOne({ where: { name: role } });
    // liên kết user vs role để thiết lập mối quan hệ many-to-many 1 user có thể có nhiều role và 1 role có thể có nhiều user 
    if (roleRecord) await user.addRole(roleRecord);

    // gửi email xác thực 
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${email_verify_token}`;
    await sendEmail({
      to: email,
      subject: 'DevHub – Xác thực tài khoản của bạn',
      html: `<p>Xin chào <strong>${full_name}</strong>,</p>
             <p>Nhấn vào link bên dưới để xác thực tài khoản:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>Link có hiệu lực trong 24 giờ.</p>`,
    });

    // ghi log nhật ký hệ thống 
    await logActivity({ ip: req.ip, headers: req.headers, user: { id: user.id, role } }, {
      action: 'USER_REGISTER',
      entity_type: 'user',
      entity_id: user.id,
      entity_name: full_name,
      description: `${full_name} (${email}) đã đăng ký tài khoản mới với vai trò ${role}`,
    });

    // phản hồi lại hàm authApi.register() ở Frontend đang chờ
    res.status(201).json({
      success: true,
      message: 'Registered successfully. Please check your email to verify your account.',
    });
  } catch (error) { next(error); }
};

// GET /api/auth/verify-email/:token
// Xác thực email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    // tìm user với email_verify_token giống token
    const user = await User.findOne({ where: { email_verify_token: token } });
    // nếu không tìm thấy user thì báo lỗi
    if (!user) throw new AppError('Invalid or expired verification token', 400);

    // cập nhật trạng thái user thành verified và active đồng thời xóa email_verify_token
    await user.update({ email_verified: true, status: 'ACTIVE', email_verify_token: null });

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) { next(error); }
};

// POST /api/auth/login
// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // tìm user trong db với email giống email người dùng nhập
    const user = await User.findOne({ where: { email } });
    // nếu không tìm thấy user thì báo lỗi
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.status === 'LOCKED') throw new AppError('Account is locked. Contact support.', 403);
    if (!user.email_verified) throw new AppError('Please verify your email first', 401);

    // so sánh mật khẩu người dùng nhập và mật khẩu trong db 
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    // tạo access token và refresh token 
    const accessToken = generateAccessToken(user.id);// 15p, dùng gắn vào request headers
    const refreshToken = generateRefreshToken(user.id);// 7 ngày, dùng để lấy access token khi hết hạn 

    await user.update({ refresh_token: refreshToken });// lưu refresh token vào db
    // / lưu refresh token vào cookie vs cờ HttpOnly để tránh bị đánh cắp, hạn 7 ngày 
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });


    // lấy thông tin user vừa đăng nhập bao gồm cả role 
    const userWithRoles = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }],
    });

    // ghi nhật ký đăng nhập 
    await logActivity({ ip: req.ip, headers: req.headers, user: { id: user.id, role: userWithRoles.Roles?.[0]?.name } }, {
      action: 'USER_LOGIN',
      entity_type: 'user',
      entity_id: user.id,
      entity_name: user.full_name,
      description: `${user.full_name} đã đăng nhập vào hệ thống`,
    });

    // trả thông tin về cho trình duyệt 
    res.json({
      success: true,
      data: { user: userWithRoles, accessToken },
    });
  } catch (error) { next(error); }
};

// POST /api/auth/google
// Đăng nhập bằng Google
exports.googleLogin = async (req, res, next) => {
  try {
    // nhận token từ frontend
    const { token } = req.body;

    // Kiểm tra xem mã đó có đúng do google cấp không
    // nếu đúng mã hóa nó thành vé ticket chứa thông tin như email, name, picture
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    // lấy thông tin trong vé ticket 
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // tìm user trong db với email giống email người dùng nhập
    let user = await User.findOne({ where: { email } });
    // nếu tài khoản bị khóa thì báo lỗi
    if (user && user.status === 'LOCKED') {
      throw new AppError('Account is locked. Contact support.', 403);
    }
    // nếu không tìm thấy user thì tạo user mới
    if (!user) {
      // tạo user mới 
      // tạo mật khẩu ngẫu nhiên
      const password_hash = await bcrypt.hash(generateRandomToken(), 12);
      user = await User.create({
        email,
        full_name: name,
        password_hash,
        email_verified: true,
        status: 'ACTIVE'
      });
      // gán vai trò mặt định là ứng viên
      const roleRecord = await Role.findOne({ where: { name: 'CANDIDATE' } });
      if (roleRecord) await user.addRole(roleRecord);
      // nếu user đã tồn tại nhưng email chưa được xác thực thì xác thực email
    } else if (!user.email_verified) {
      // cập nhật thành đã xác thực 
      await user.update({ email_verified: true, status: 'ACTIVE' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await user.update({ refresh_token: refreshToken });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // lấy thông tin user vừa đăng nhập bao gồm cả role 
    const userWithRoles = await User.findByPk(user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }],
    });

    // trả về thông tin user và access token 
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
// Tự động cấp lại khóa 
exports.refresh = async (req, res, next) => {
  try {
    // lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;
    // nếu không có refresh token thì trả về lỗi 401
    if (!token) throw new AppError('No refresh token', 401);
    // giải mã refresh token, nếu thành công sẽ có được id của user 
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    // lấy user từ database thông qua id
    const user = await User.findByPk(decoded.id);
    // kiểm tra xem refresh token có hợp lệ không
    if (!user || user.refresh_token !== token) throw new AppError('Invalid refresh token', 401);

    // tạo access token mới
    const newAccessToken = generateAccessToken(user.id);
    // trả về access token mới cho trình duyệt
    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) { next(error); }
};

// POST /api/auth/logout
// đăng xuất người dùng 
exports.logout = async (req, res, next) => {
  try {
    // đọc cookie để biết ai đang đăng xuất
    const token = req.cookies?.refreshToken;
    let loggedUser = null;
    // tìm user dựa vào refresh token
    if (token) {
      loggedUser = await User.findOne({ where: { refresh_token: token } });
      // cập nhật refresh token thành null để tránh bị đánh cắp 
      if (loggedUser) await loggedUser.update({ refresh_token: null });
    }
    // xóa cookie trên trình duyệt
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    // ghi log vào database 
    if (loggedUser) {
      await logActivity({ ip: req.ip, headers: req.headers, user: { id: loggedUser.id, role: req.user?.role } }, {
        action: 'USER_LOGOUT',
        entity_type: 'user',
        entity_id: loggedUser.id,
        entity_name: loggedUser.full_name,
        description: `${loggedUser.full_name} đã đăng xuất`,
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

// POST /api/auth/forgot-password
// hàm quên mật khẩu
exports.forgotPassword = async (req, res, next) => {
  try {
    // lấy email từ request
    const { email } = req.body;
    // tìm user trong database với email giống email người dùng nhập
    const user = await User.findOne({ where: { email } });
    // luôn trả về thành công để tránh bị đánh cắp email 
    if (!user) return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });

    // tạo reset token và set thời gian hiệu lực là 1 giờ 
    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.update({ reset_password_token: resetToken, reset_password_expires: expires });

    // tạo link reset password gửi mail đến người dùng 
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
// hàm xác nhận reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // lấy token từ request
    const { token } = req.params;
    // lấy password từ request
    const { password } = req.body;
    // tìm user trong database với reset token giống token người dùng nhập
    const user = await User.findOne({ where: { reset_password_token: token } });
    // nếu không tìm thấy user hoặc reset token đã hết hạn thì báo lỗi 400
    if (!user || user.reset_password_expires < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    // mã hóa password mới 
    const password_hash = await bcrypt.hash(password, 12);
    // cập nhật password mới và xóa reset token
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
