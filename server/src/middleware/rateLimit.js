// Giới hạn số lần thử để chống dò mật khẩu / mã xác minh và chống gửi thư hàng loạt.
// Bộ đếm nằm trong bộ nhớ của tiến trình (đủ cho một máy chủ như trên Railway; khởi động lại thì đếm lại từ đầu).
// Khóa theo IP nên cần `app.set('trust proxy', 1)` khi chạy sau proxy (đã có ở index.js).

const buckets = new Map(); // khóa → { count, resetAt }

setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}, 10 * 60 * 1000).unref();

const MINUTE = 60 * 1000;

/**
 * @param {string} name       tên nhóm giới hạn (để các giới hạn khác nhau không dùng chung bộ đếm)
 * @param {number} windowMs   độ dài khoảng thời gian tính
 * @param {number} max        số lần tối đa trong khoảng đó
 * @param {Function} key      (req) => chuỗi khóa; mặc định là IP của người gọi
 * @param {boolean} failuresOnly  true: chỉ tính các yêu cầu bị lỗi (mã >= 400), đăng nhập đúng không bị tính
 * @param {string} message    câu mở đầu của thông báo khi bị chặn
 */
function rateLimit({ name, windowMs, max, key = (req) => req.ip, failuresOnly = false, message = 'Bạn thao tác quá nhiều lần' }) {
  return (req, res, next) => {
    const bucketKey = `${name}:${key(req)}`;
    const now = Date.now();
    let bucket = buckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(bucketKey, bucket);
    }
    if (bucket.count >= max) {
      const seconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.set('Retry-After', String(seconds));
      return res.status(429).json({ success: false, message: `${message}. Vui lòng thử lại sau khoảng ${Math.max(1, Math.ceil(seconds / 60))} phút.` });
    }
    if (failuresOnly) {
      res.on('finish', () => { if (res.statusCode >= 400) bucket.count += 1; });
    } else {
      bucket.count += 1;
    }
    return next();
  };
}

const emailKey = (req) => `${req.ip}|${String(req.body?.email || '').trim().toLowerCase()}`;

module.exports = {
  rateLimit,
  // Đăng nhập sai: 8 lần / 15 phút cho mỗi cặp IP + email, và 40 lần / 15 phút cho mỗi IP (chống thử nhiều email)
  loginByEmail: rateLimit({ name: 'login-email', windowMs: 15 * MINUTE, max: 8, key: emailKey, failuresOnly: true, message: 'Bạn đã nhập sai thông tin đăng nhập quá nhiều lần' }),
  loginByIp: rateLimit({ name: 'login-ip', windowMs: 15 * MINUTE, max: 40, failuresOnly: true, message: 'Có quá nhiều lần đăng nhập sai từ thiết bị này' }),
  // Mã xác minh 2 bước có 6 chữ số nên chỉ cho sai vài lần
  twoFactorAttempts: rateLimit({ name: '2fa', windowMs: 15 * MINUTE, max: 6, failuresOnly: true, message: 'Bạn đã nhập sai mã xác minh quá nhiều lần' }),
  // Các thao tác gửi email: 5 lần / giờ cho mỗi cặp IP + email
  sendEmailByEmail: rateLimit({ name: 'send-email', windowMs: 60 * MINUTE, max: 5, key: emailKey, message: 'Bạn đã yêu cầu gửi email quá nhiều lần' }),
  sendEmailByChallenge: rateLimit({ name: 'send-email-2fa', windowMs: 60 * MINUTE, max: 5, message: 'Bạn đã yêu cầu gửi lại mã quá nhiều lần' }),
  // Đăng ký: 10 tài khoản / giờ cho mỗi IP
  register: rateLimit({ name: 'register', windowMs: 60 * MINUTE, max: 10, message: 'Bạn đã đăng ký quá nhiều tài khoản từ thiết bị này' }),
  // Đường dẫn đặt lại mật khẩu / xác thực email sai: 20 lần / giờ cho mỗi IP
  tokenAttempts: rateLimit({ name: 'token', windowMs: 60 * MINUTE, max: 20, failuresOnly: true, message: 'Bạn đã dùng liên kết không hợp lệ quá nhiều lần' }),
  // Đổi mật khẩu khi đã đăng nhập: nhập sai mật khẩu hiện tại tối đa 8 lần / 15 phút cho mỗi tài khoản
  changePassword: rateLimit({ name: 'change-password', windowMs: 15 * MINUTE, max: 8, key: (req) => req.user?.id || req.ip, failuresOnly: true, message: 'Bạn đã nhập sai mật khẩu hiện tại quá nhiều lần' }),
};
