const { User } = require('../models');
const sendEmail = require('./sendEmail');

// Gửi email kèm mỗi thông báo trong hệ thống (chuông 🔔).
// - Gửi NỀN theo hàng đợi: không làm chậm thao tác của người dùng, không bắn dồn dập khiến Gmail chặn.
// - Lỗi gửi mail (SMTP sai, mạng...) chỉ ghi log, không bao giờ làm hỏng thao tác chính.
// - Tắt bằng EMAIL_DISABLED=true (dùng khi chạy thử/kiểm thử); chưa cấu hình EMAIL_USER/EMAIL_PASS thì bỏ qua.

let queue = Promise.resolve();

const isEnabled = () =>
  process.env.EMAIL_DISABLED !== 'true' && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Bỏ emoji đầu tiêu đề cho dòng "Chủ đề" của email (hộp thư nhìn gọn hơn)
const plainTitle = (title) => String(title || 'Thông báo mới').replace(/^[^\p{L}\p{N}]+/u, '').trim() || 'Thông báo mới';

const buildHtml = ({ name, title, message, url }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">DevHub Internal</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Thông báo từ hệ thống quản lý dự án</p>
    </div>
    <div style="background: white; padding: 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
      <h2 style="color: #111827; margin: 0 0 20px; font-size: 18px;">${escapeHtml(title)}</h2>
      <p style="color: #374151; margin: 0 0 16px;">Xin chào <strong>${escapeHtml(name)}</strong>,</p>
      ${message ? `<p style="color: #374151; margin: 0 0 16px; white-space: pre-line;">${escapeHtml(message)}</p>` : ''}
      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="${escapeHtml(url)}" target="_blank"
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
          Mở trên DevHub
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
        DevHub — Nền tảng kết nối ứng viên IT với các dự án thực tế<br>
        Email này được gửi tự động, vui lòng không trả lời.
      </p>
    </div>
  </div>`;

async function deliver({ user_id, title, message, link }) {
  const user = await User.findByPk(user_id, { attributes: ['email', 'full_name', 'status'] });
  // Chỉ gửi cho tài khoản đang hoạt động (bỏ qua tài khoản bị khóa / chưa kích hoạt)
  if (!user?.email || user.status !== 'ACTIVE') return false;
  const base = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  await sendEmail({
    to: user.email,
    subject: `[DevHub] ${plainTitle(title)}`,
    html: buildHtml({ name: user.full_name, title: plainTitle(title), message, url: `${base}${link || ''}` }),
  });
  return true;
}

// Đưa email vào hàng đợi và trả về ngay (không await trong luồng xử lý chính)
function emailNotification(notification) {
  if (!isEnabled() || !notification?.user_id) return Promise.resolve(false);
  queue = queue
    .then(() => deliver(notification))
    .catch((error) => {
      console.error(`[Mailer] Không gửi được email thông báo: ${error.message}`);
      return false;
    });
  return queue;
}

// Chờ gửi hết các email đang trong hàng đợi (dùng khi kiểm thử / tắt server)
const flushEmails = () => queue;

module.exports = { emailNotification, flushEmails, plainTitle };
