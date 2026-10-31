const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Role, CandidateProfile, Company, RefreshToken } = require('../models');
const { generateAccessToken, generateRefreshToken, generateRandomToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { logActivity } = require('../utils/activityLogger');
const { escapeHtml } = require('../utils/escapeHtml');
const { issueChallenge, verifyChallenge, readChallengeUser, maskEmail } = require('../utils/twoFactor');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // link xác thực email có hiệu lực 24 giờ
const RESEND_COOLDOWN_MS = 60 * 1000; // gửi lại email xác thực: tối thiểu cách nhau 60 giây
const MAX_SESSIONS = 10; // số thiết bị được đăng nhập cùng lúc cho mỗi tài khoản

// Băm sẵn một mật khẩu giả: email không tồn tại vẫn tốn thời gian so sánh như email có thật (không dò được email qua thời gian phản hồi)
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(crypto.randomBytes(8).toString('hex'), 12);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Mở một phiên đăng nhập cho thiết bị hiện tại: cấp refresh token, lưu bản băm của nó và gắn vào cookie.
// Mỗi thiết bị một phiên riêng nên đăng nhập ở máy này không làm máy khác bị đăng xuất.
async function startSession(user, req, res) {
  const refreshToken = generateRefreshToken(user.id);
  const expiresAtMs = jwt.decode(refreshToken).exp * 1000;
  await RefreshToken.create({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    user_agent: (req.headers['user-agent'] || '').slice(0, 255),
    expires_at: new Date(expiresAtMs),
  });
  // Dọn các phiên đã hết hạn, và chỉ giữ MAX_SESSIONS phiên mới nhất
  await RefreshToken.destroy({ where: { user_id: user.id, expires_at: { [Op.lt]: new Date() } } });
  const surplus = await RefreshToken.findAll({
    where: { user_id: user.id }, attributes: ['id'], order: [['created_at', 'DESC']], offset: MAX_SESSIONS,
  });
  if (surplus.length) await RefreshToken.destroy({ where: { id: surplus.map((s) => s.id) } });
  // lưu refresh token vào cookie vs cờ HttpOnly để tránh bị đánh cắp
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: expiresAtMs - Date.now() });
}

// Gửi email xác thực tài khoản. Trả về true/false (không ném lỗi): gửi thư lỗi (SMTP...) không được làm hỏng việc đăng ký
async function sendVerificationEmail(user) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${user.email_verify_token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'DevHub – Xác thực tài khoản của bạn',
      html: `<p>Xin chào <strong>${escapeHtml(user.full_name)}</strong>,</p>
             <p>Nhấn vào link bên dưới để xác thực tài khoản:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>
             <p>Link có hiệu lực trong 24 giờ.</p>`,
    });
    return true;
  } catch (err) {
    console.error('[auth] Gửi email xác thực lỗi:', err.message);
    return false;
  }
}

// Cấp link xác thực mới (hiệu lực 24 giờ) rồi gửi email
async function issueVerification(user) {
  await user.update({
    email_verify_token: generateRandomToken(),
    email_verify_expires: new Date(Date.now() + VERIFY_TTL_MS),
  });
  return sendVerificationEmail(user);
}

// POST /api/auth/register
// Đăng ký tài khoản mới
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, role = 'CANDIDATE' } = req.body;

    // kiểm tra xem email đã tồn tại chưa
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      // Đã đăng ký nhưng chưa xác thực: giao diện sẽ gợi ý gửi lại email xác thực
      throw new AppError('Email này đã được đăng ký', 409, existing.email_verified ? 'EMAIL_EXISTS' : 'EMAIL_NOT_VERIFIED');
    }

    // kiểm tra xem vai trò có hợp lệ không
    const validRoles = ['CANDIDATE', 'EMPLOYER'];
    if (!validRoles.includes(role)) throw new AppError('Vai trò không hợp lệ', 400);
    // mã hóa mật khẩu
    const password_hash = await bcrypt.hash(password, 12);

    // tạo user (kèm mã xác thực email 64 ký tự, hiệu lực 24 giờ)
    const user = await User.create({
      email, password_hash, full_name,
      email_verify_token: generateRandomToken(),
      email_verify_expires: new Date(Date.now() + VERIFY_TTL_MS),
      status: 'INACTIVE',
    });

    // tìm vai trò
    const roleRecord = await Role.findOne({ where: { name: role } });
    // liên kết user vs role để thiết lập mối quan hệ many-to-many 1 user có thể có nhiều role và 1 role có thể có nhiều user
    if (roleRecord) await user.addRole(roleRecord);

    // gửi email xác thực (gửi lỗi vẫn giữ tài khoản, người dùng bấm "Gửi lại email xác thực" sau)
    const emailSent = await sendVerificationEmail(user);

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
      message: emailSent
        ? 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
        : 'Đăng ký thành công nhưng chưa gửi được email xác thực. Hãy bấm "Gửi lại email xác thực".',
      data: { email_sent: emailSent },
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
    if (!user) throw new AppError('Link xác thực không hợp lệ hoặc đã được sử dụng', 400, 'VERIFY_TOKEN_INVALID');
    if (user.email_verify_expires && new Date(user.email_verify_expires) < new Date()) {
      throw new AppError('Link xác thực đã hết hạn. Hãy yêu cầu gửi lại email xác thực', 400, 'VERIFY_TOKEN_EXPIRED');
    }

    // cập nhật trạng thái user thành verified và active đồng thời xóa token (tài khoản đang bị khóa thì giữ nguyên khóa)
    await user.update({
      email_verified: true,
      status: user.status === 'LOCKED' ? 'LOCKED' : 'ACTIVE',
      email_verify_token: null,
      email_verify_expires: null,
    });

    res.json({ success: true, message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay.' });
  } catch (error) { next(error); }
};

// POST /api/auth/resend-verification
// Gửi lại email xác thực cho tài khoản đã đăng ký nhưng chưa xác thực (email lỗi / link hết hạn / không nhận được thư)
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Email lạ hoặc đã xác thực thì trả lời y như thành công, không để lộ email nào đã đăng ký
    const reply = {
      success: true,
      message: 'Nếu email này đã đăng ký và chưa xác thực, chúng tôi vừa gửi lại link xác thực. Vui lòng kiểm tra hộp thư.',
    };
    const user = await User.findOne({ where: { email } });
    if (!user || user.email_verified || user.status === 'LOCKED') return res.json(reply);

    // Chống gửi dồn dập: thời điểm gửi lần trước = hạn dùng của link - 24 giờ
    const lastSentAt = user.email_verify_expires ? new Date(user.email_verify_expires).getTime() - VERIFY_TTL_MS : 0;
    if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
      throw new AppError('Bạn vừa yêu cầu gửi email xác thực, vui lòng đợi khoảng 1 phút rồi thử lại', 429, 'RESEND_TOO_SOON');
    }

    const sent = await issueVerification(user);
    if (!sent) throw new AppError('Chưa gửi được email lúc này, vui lòng thử lại sau ít phút', 502);
    res.json(reply);
  } catch (error) { next(error); }
};

// Hoàn tất đăng nhập: cấp access token (15p, gắn vào request headers), mở phiên mới cho thiết bị này (refresh token 7 ngày, lưu cookie),
// ghi nhật ký và trả thông tin user (kèm role) về trình duyệt
async function finishLogin(user, req, res) {
  const accessToken = generateAccessToken(user.id);
  await startSession(user, req, res);

  const userWithRoles = await User.findByPk(user.id, {
    attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
    include: [{ association: 'Roles', attributes: ['name'] }],
  });

  await logActivity({ ip: req.ip, headers: req.headers, user: { id: user.id, role: userWithRoles.Roles?.[0]?.name } }, {
    action: 'USER_LOGIN',
    entity_type: 'user',
    entity_id: user.id,
    entity_name: user.full_name,
    description: `${user.full_name} đã đăng nhập vào hệ thống`,
  });

  res.json({ success: true, data: { user: userWithRoles, accessToken } });
}

// POST /api/auth/login/2fa
// Bước 2 khi tài khoản bật xác minh 2 bước: nhập mã 6 số đã gửi qua email
exports.loginTwoFactor = async (req, res, next) => {
  try {
    const userId = verifyChallenge(req.body.challenge, req.body.code, 'login');
    const user = await User.findByPk(userId);
    if (!user || user.status === 'LOCKED') throw new AppError('Tài khoản không thể đăng nhập', 403);
    await finishLogin(user, req, res);
  } catch (error) { next(error); }
};

// POST /api/auth/login/2fa/resend
// Gửi lại mã (cách nhau tối thiểu 1 phút) và cấp challenge mới
exports.resendTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findByPk(readChallengeUser(req.body.challenge, 'login'));
    if (!user || user.status === 'LOCKED' || !user.two_factor_enabled) throw new AppError('Yêu cầu xác minh không hợp lệ', 400);
    const challenge = await issueChallenge(user, 'login');
    res.json({ success: true, message: 'Đã gửi lại mã xác minh', data: { challenge, email: maskEmail(user.email) } });
  } catch (error) { next(error); }
};

// POST /api/auth/login
// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // tìm user trong db với email giống email người dùng nhập
    const user = await User.findOne({ where: { email } });
    // so sánh mật khẩu người dùng nhập và mật khẩu trong db (email không tồn tại vẫn so với mật khẩu giả cho cùng thời gian)
    const isMatch = await bcrypt.compare(password, user ? user.password_hash : DUMMY_PASSWORD_HASH);
    // sai email hoặc mật khẩu thì báo chung một câu, không cho biết sai ở đâu
    if (!user || !isMatch) throw new AppError('Email hoặc mật khẩu không đúng', 401);
    // chỉ khi đúng mật khẩu mới báo tình trạng tài khoản: người lạ không dò được email nào đang bị khóa / chưa xác thực
    if (user.status === 'LOCKED') throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên', 403);
    if (!user.email_verified) {
      throw new AppError('Tài khoản chưa xác thực email. Hãy kiểm tra hộp thư hoặc gửi lại email xác thực', 403, 'EMAIL_NOT_VERIFIED');
    }

    // bật xác minh 2 bước: chưa cấp phiên, gửi mã qua email rồi chờ người dùng nhập (POST /auth/login/2fa)
    if (user.two_factor_enabled) {
      const challenge = await issueChallenge(user, 'login', { cooldown: false });
      return res.json({ success: true, data: { requires_2fa: true, challenge, email: maskEmail(user.email) } });
    }
    await finishLogin(user, req, res);
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
    // Chỉ tin email do Google đã xác minh, nếu không có thể chiếm tài khoản trùng email của người khác
    if (!payload.email_verified) throw new AppError('Email Google này chưa được xác minh', 401);

    // tìm user trong db với email giống email người dùng nhập
    let user = await User.findOne({ where: { email } });
    // nếu tài khoản bị khóa thì báo lỗi
    if (user && user.status === 'LOCKED') {
      throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên', 403);
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
    await startSession(user, req, res);

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
      next(new AppError('Đăng nhập Google không thành công', 401));
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
    const expired = () => new AppError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 401);
    // nếu không có refresh token thì trả về lỗi 401
    if (!token) throw expired();
    // giải mã refresh token, nếu thành công sẽ có được id của user
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } catch { throw expired(); }
    // phiên này phải còn trong bảng refresh_tokens (chưa đăng xuất, chưa bị đổi mật khẩu thu hồi, chưa hết hạn)
    const session = await RefreshToken.findOne({
      where: { token_hash: hashToken(token), user_id: decoded.id, expires_at: { [Op.gt]: new Date() } },
    });
    if (!session) throw expired();
    // lấy user từ database thông qua id
    const user = await User.findByPk(decoded.id);
    if (!user) throw expired();
    if (user.status === 'LOCKED') throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên', 403);

    // tạo access token mới và trả về cho trình duyệt
    res.json({ success: true, data: { accessToken: generateAccessToken(user.id) } });
  } catch (error) { next(error); }
};

// POST /api/auth/logout
// đăng xuất người dùng
exports.logout = async (req, res, next) => {
  try {
    // đọc cookie để biết ai đang đăng xuất
    const token = req.cookies?.refreshToken;
    let loggedUser = null;
    if (token) {
      // chỉ xóa phiên của thiết bị này, các thiết bị khác vẫn đăng nhập
      const session = await RefreshToken.findOne({ where: { token_hash: hashToken(token) } });
      if (session) {
        loggedUser = await User.findByPk(session.user_id);
        await session.destroy();
      }
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

    res.json({ success: true, message: 'Đã đăng xuất' });
  } catch (error) { next(error); }
};

// POST /api/auth/forgot-password
// hàm quên mật khẩu
exports.forgotPassword = async (req, res, next) => {
  try {
    // lấy email từ request
    const { email } = req.body;
    const reply = { success: true, message: 'Nếu email này đã đăng ký, chúng tôi vừa gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.' };
    // tìm user trong database với email giống email người dùng nhập
    const user = await User.findOne({ where: { email } });
    // luôn trả về thành công để tránh bị đánh cắp email
    if (!user) return res.json(reply);

    // tạo reset token và set thời gian hiệu lực là 1 giờ
    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.update({ reset_password_token: resetToken, reset_password_expires: expires });

    // tạo link reset password gửi mail đến người dùng
    // (gửi thư lỗi chỉ ghi log và vẫn trả lời như thường, để không lộ email nào có trong hệ thống)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: email,
      subject: 'DevHub – Đặt lại mật khẩu',
      html: `<p>Nhấn vào link bên dưới để đặt lại mật khẩu (hiệu lực 1 giờ):</p><a href="${resetUrl}">${resetUrl}</a>`,
    }).catch((err) => console.error('[auth] Gửi email đặt lại mật khẩu lỗi:', err.message));

    res.json(reply);
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
      throw new AppError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400);
    }
    // mã hóa password mới
    const password_hash = await bcrypt.hash(password, 12);
    // cập nhật password mới và xóa reset token
    await user.update({ password_hash, reset_password_token: null, reset_password_expires: null });
    // đổi mật khẩu thì đăng xuất khỏi mọi thiết bị
    await RefreshToken.destroy({ where: { user_id: user.id } });
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' });
  } catch (error) { next(error); }
};

// PUT /api/auth/me/avatar — đổi / gỡ ảnh đại diện của chính mình (ảnh đã tải lên qua /api/upload/image)
exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar_url } = req.body;
    // Chỉ nhận ảnh nằm trong thư mục ảnh của hệ thống (hoặc null để gỡ ảnh)
    if (avatar_url && !/^\/uploads\/images\/[\w.-]+$/.test(avatar_url)) {
      throw new AppError('Ảnh đại diện không hợp lệ', 400);
    }
    const user = await User.findByPk(req.user.id);
    await user.update({ avatar_url: avatar_url || null });
    // Ứng viên: đồng bộ sang hồ sơ để các màn hình khác (workspace, tìm ứng viên) hiển thị cùng ảnh
    await CandidateProfile.update({ avatar_url: avatar_url || null }, { where: { user_id: user.id } });
    // Nhà tuyển dụng: ảnh đại diện chính là logo công ty
    await Company.update({ logo_url: avatar_url || null }, { where: { user_id: user.id } });
    res.json({ success: true, data: { avatar_url: user.avatar_url }, message: avatar_url ? 'Đã cập nhật ảnh đại diện' : 'Đã gỡ ảnh đại diện' });
  } catch (error) { next(error); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'email_verify_token', 'reset_password_token'] },
      include: [{ association: 'Roles', attributes: ['name'] }],
    });
    const data = user.toJSON();
    // Ứng viên: số điện thoại / địa chỉ lấy từ hồ sơ năng lực (nơi họ vẫn sửa)
    const profile = await CandidateProfile.findOne({ where: { user_id: user.id }, attributes: ['phone', 'address'] });
    if (profile) Object.assign(data, { phone: profile.phone, address: profile.address });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
