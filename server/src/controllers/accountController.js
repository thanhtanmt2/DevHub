const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, CandidateProfile, RefreshToken } = require('../models');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/sendEmail');
const { escapeHtml } = require('../utils/escapeHtml');
const { logActivity } = require('../utils/activityLogger');
const { issueChallenge, verifyChallenge, maskEmail } = require('../utils/twoFactor');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const PHONE_RE = /^(\+?84|0)(3|5|7|8|9)\d{8}$/;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const clean = (v) => (typeof v === 'string' ? v.trim() : v);

const actor = (req, user) => ({ ip: req.ip, headers: req.headers, user: { id: user.id, role: req.userRoles?.[0] } });

// PUT /api/auth/me/profile
// Sửa thông tin cá nhân. Ứng viên: số điện thoại / địa chỉ dùng chung với hồ sơ năng lực nên ghi sang cả hồ sơ.
exports.updateProfile = async (req, res, next) => {
  try {
    const full_name = clean(req.body.full_name);
    const phone = clean(req.body.phone) || null;
    const address = clean(req.body.address) || null;
    const gender = req.body.gender || null;
    const date_of_birth = req.body.date_of_birth || null;

    if (!full_name || full_name.length < 2) throw new AppError('Vui lòng nhập họ và tên (tối thiểu 2 ký tự)', 400);
    if (full_name.length > 150) throw new AppError('Họ và tên tối đa 150 ký tự', 400);
    if (phone && !PHONE_RE.test(phone.replace(/[\s.-]/g, ''))) throw new AppError('Số điện thoại không hợp lệ', 400);
    if (address && address.length > 255) throw new AppError('Địa chỉ tối đa 255 ký tự', 400);
    if (gender && !GENDERS.includes(gender)) throw new AppError('Giới tính không hợp lệ', 400);
    if (date_of_birth) {
      const d = new Date(date_of_birth);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth) || Number.isNaN(d.getTime())) throw new AppError('Ngày sinh không hợp lệ', 400);
      if (d > new Date()) throw new AppError('Ngày sinh không được ở tương lai', 400);
      if (d.getFullYear() < 1920) throw new AppError('Ngày sinh không hợp lệ', 400);
    }
    const phoneNorm = phone ? phone.replace(/[\s.-]/g, '') : null;

    const user = await User.findByPk(req.user.id);
    await user.update({ full_name, phone: phoneNorm, address, gender, date_of_birth });
    await CandidateProfile.update({ phone: phoneNorm, address }, { where: { user_id: user.id } });

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin cá nhân',
      data: { full_name, phone: phoneNorm, address, gender, date_of_birth },
    });
  } catch (error) { next(error); }
};

// PUT /api/auth/me/password
// Đổi mật khẩu khi đang đăng nhập: cần mật khẩu hiện tại. Xong thì đăng xuất mọi thiết bị khác.
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password) throw new AppError('Vui lòng nhập mật khẩu hiện tại', 400);
    if (!new_password || new_password.length < 8) throw new AppError('Mật khẩu mới tối thiểu 8 ký tự', 400);
    if (new_password.length > 72) throw new AppError('Mật khẩu mới tối đa 72 ký tự', 400);

    const user = await User.findByPk(req.user.id);
    if (!(await bcrypt.compare(current_password, user.password_hash))) throw new AppError('Mật khẩu hiện tại không đúng', 400);
    if (current_password === new_password) throw new AppError('Mật khẩu mới phải khác mật khẩu hiện tại', 400);

    await user.update({ password_hash: await bcrypt.hash(new_password, 12), reset_password_token: null, reset_password_expires: null });

    // thu hồi mọi phiên khác: chỉ giữ thiết bị đang đổi mật khẩu
    const token = req.cookies?.refreshToken;
    await RefreshToken.destroy({ where: { user_id: user.id, ...(token ? { token_hash: { [Op.ne]: hashToken(token) } } : {}) } });

    await logActivity(actor(req, user), {
      action: 'PASSWORD_CHANGED', entity_type: 'user', entity_id: user.id, entity_name: user.full_name,
      description: `${user.full_name} đã đổi mật khẩu`,
    });
    // báo qua email để chủ tài khoản biết nếu không phải mình làm (gửi lỗi cũng không làm hỏng việc đổi mật khẩu)
    sendEmail({
      to: user.email,
      subject: 'DevHub – Mật khẩu của bạn đã được thay đổi',
      html: `<p>Xin chào <strong>${escapeHtml(user.full_name)}</strong>,</p>
             <p>Mật khẩu tài khoản DevHub của bạn vừa được thay đổi. Các thiết bị khác đã bị đăng xuất.</p>
             <p>Nếu không phải bạn thực hiện, hãy dùng chức năng "Quên mật khẩu" để đặt lại ngay và liên hệ hỗ trợ.</p>`,
    }).catch((e) => console.error('[account] Gửi email báo đổi mật khẩu lỗi:', e.message));

    res.json({ success: true, message: 'Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.' });
  } catch (error) { next(error); }
};

// GET /api/auth/me/sessions — các thiết bị đang đăng nhập (mới nhất trước), đánh dấu thiết bị hiện tại
exports.listSessions = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const currentHash = token ? hashToken(token) : null;
    const rows = await RefreshToken.findAll({
      where: { user_id: req.user.id, expires_at: { [Op.gt]: new Date() } },
      attributes: ['id', 'token_hash', 'user_agent', 'createdAt', 'expires_at'],
      order: [['created_at', 'DESC']],
    });
    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id, user_agent: r.user_agent, created_at: r.createdAt, expires_at: r.expires_at, current: r.token_hash === currentHash,
      })),
    });
  } catch (error) { next(error); }
};

// DELETE /api/auth/me/sessions/:id — đăng xuất một thiết bị khác
// DELETE /api/auth/me/sessions — đăng xuất tất cả thiết bị khác (giữ thiết bị hiện tại)
exports.revokeSessions = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const currentHash = token ? hashToken(token) : null;
    const where = { user_id: req.user.id };
    if (req.params.id) {
      if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) throw new AppError('Không tìm thấy thiết bị', 404);
      where.id = req.params.id;
    }
    if (currentHash) where.token_hash = { [Op.ne]: currentHash };
    const n = await RefreshToken.destroy({ where });
    if (req.params.id && !n) throw new AppError('Không thể đăng xuất thiết bị này (thiết bị hiện tại hoặc không tồn tại)', 404);
    res.json({ success: true, message: req.params.id ? 'Đã đăng xuất thiết bị' : `Đã đăng xuất ${n} thiết bị khác` });
  } catch (error) { next(error); }
};

// POST /api/auth/me/2fa/send-code — gửi mã xác nhận tới email để bật xác minh 2 bước
exports.sendEnableCode = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user.two_factor_enabled) throw new AppError('Xác minh 2 bước đã được bật', 400);
    const challenge = await issueChallenge(user, 'enable');
    res.json({ success: true, message: `Đã gửi mã xác nhận tới ${maskEmail(user.email)}`, data: { challenge, email: maskEmail(user.email) } });
  } catch (error) { next(error); }
};

// POST /api/auth/me/2fa/enable { challenge, code }
exports.enableTwoFactor = async (req, res, next) => {
  try {
    const id = verifyChallenge(req.body.challenge, req.body.code, 'enable');
    if (id !== req.user.id) throw new AppError('Yêu cầu xác minh không hợp lệ', 400);
    await User.update({ two_factor_enabled: true }, { where: { id } });
    res.json({ success: true, message: 'Đã bật xác minh 2 bước', data: { two_factor_enabled: true } });
  } catch (error) { next(error); }
};

// POST /api/auth/me/2fa/disable { password }
exports.disableTwoFactor = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!req.body.password || !(await bcrypt.compare(req.body.password, user.password_hash))) throw new AppError('Mật khẩu không đúng', 400);
    await user.update({ two_factor_enabled: false });
    res.json({ success: true, message: 'Đã tắt xác minh 2 bước', data: { two_factor_enabled: false } });
  } catch (error) { next(error); }
};

// PUT /api/auth/me/privacy { is_searchable } — chỉ ứng viên
exports.updatePrivacy = async (req, res, next) => {
  try {
    if (typeof req.body.is_searchable !== 'boolean') throw new AppError('Dữ liệu không hợp lệ', 400);
    const [n] = await CandidateProfile.update({ is_searchable: req.body.is_searchable }, { where: { user_id: req.user.id } });
    if (!n) throw new AppError('Chỉ tài khoản ứng viên có cài đặt này', 400);
    res.json({
      success: true,
      message: req.body.is_searchable ? 'Nhà tuyển dụng có thể tìm thấy hồ sơ của bạn' : 'Hồ sơ của bạn đã được ẩn khỏi mục Tìm ứng viên',
      data: { is_searchable: req.body.is_searchable },
    });
  } catch (error) { next(error); }
};
