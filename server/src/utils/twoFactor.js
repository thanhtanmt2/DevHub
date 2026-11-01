const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('./sendEmail');
const AppError = require('./AppError');
const { escapeHtml } = require('./escapeHtml');

// Xác minh 2 bước bằng mã 6 số gửi qua email.
// Không lưu mã trong database: mã = HMAC(JWT_SECRET, user.id + nonce) nên chỉ server mới tính ra được; "challenge" là JWT 10 phút
// chứa user.id + nonce. Số lần nhập sai và thời điểm gửi lại được nhớ trong bộ nhớ tiến trình (đủ cho một server; đổi sang
// Redis khi chạy nhiều tiến trình).
const CHALLENGE_TTL = '10m';
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map(); // nonce → { count, exp }
const lastSent = new Map(); // userId → thời điểm gửi gần nhất

const purge = () => {
  const now = Date.now();
  for (const [k, v] of attempts) if (v.exp < now) attempts.delete(k);
  for (const [k, t] of lastSent) if (now - t > RESEND_COOLDOWN_MS) lastSent.delete(k);
};

const codeFor = (userId, nonce) => {
  const h = crypto.createHmac('sha256', process.env.JWT_SECRET).update(`2fa:${userId}:${nonce}`).digest('hex');
  return String(parseInt(h.slice(0, 8), 16) % 1000000).padStart(6, '0');
};

const maskEmail = (email) => {
  const [name, domain] = String(email).split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};

// Tạo challenge mới cho user và gửi mã qua email. purpose: 'login' (đăng nhập) | 'enable' (bật 2 bước)
async function issueChallenge(user, purpose, { cooldown = true } = {}) {
  purge();
  const prev = lastSent.get(user.id);
  if (cooldown && prev && Date.now() - prev < RESEND_COOLDOWN_MS) {
    throw new AppError('Vui lòng đợi khoảng 1 phút trước khi yêu cầu gửi lại mã', 429);
  }
  const nonce = crypto.randomBytes(12).toString('hex');
  const code = codeFor(user.id, nonce);
  try {
    await sendEmail({
      to: user.email,
      subject: `DevHub – Mã xác minh ${code}`,
      html: `<p>Xin chào <strong>${escapeHtml(user.full_name)}</strong>,</p>
             <p>Mã xác minh ${purpose === 'enable' ? 'để bật xác minh 2 bước' : 'đăng nhập'} của bạn là:</p>
             <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
             <p>Mã có hiệu lực trong 10 phút. Nếu không phải bạn yêu cầu, hãy bỏ qua email này và đổi mật khẩu.</p>`,
    });
  } catch (err) {
    console.error('[2fa] Gửi mã xác minh lỗi:', err.message);
    throw new AppError('Chưa gửi được email chứa mã xác minh, vui lòng thử lại sau', 502);
  }
  lastSent.set(user.id, Date.now());
  attempts.set(nonce, { count: 0, exp: Date.now() + CHALLENGE_TTL_MS });
  return jwt.sign({ id: user.id, nonce, purpose }, process.env.JWT_SECRET, { expiresIn: CHALLENGE_TTL });
}

// Kiểm tra mã người dùng nhập với challenge. Trả về userId nếu đúng, ném lỗi nếu sai / hết hạn / nhập sai quá nhiều
function verifyChallenge(challenge, code, purpose) {
  let p;
  try { p = jwt.verify(challenge || '', process.env.JWT_SECRET); } catch { throw new AppError('Mã xác minh đã hết hạn, hãy yêu cầu gửi lại mã', 401, 'TWO_FACTOR_EXPIRED'); }
  if (p.purpose !== purpose || !p.nonce) throw new AppError('Yêu cầu xác minh không hợp lệ', 400);
  const st = attempts.get(p.nonce);
  if (!st) throw new AppError('Mã xác minh đã hết hạn, hãy yêu cầu gửi lại mã', 401, 'TWO_FACTOR_EXPIRED');
  if (st.count >= MAX_ATTEMPTS) {
    attempts.delete(p.nonce);
    throw new AppError('Bạn đã nhập sai quá nhiều lần, hãy yêu cầu gửi lại mã mới', 429, 'TWO_FACTOR_EXPIRED');
  }
  const input = String(code || '').trim();
  const expected = codeFor(p.id, p.nonce);
  const ok = input.length === expected.length && crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  if (!ok) {
    st.count += 1;
    throw new AppError(`Mã xác minh không đúng (còn ${Math.max(0, MAX_ATTEMPTS - st.count)} lần thử)`, 400);
  }
  attempts.delete(p.nonce); // mã chỉ dùng được một lần
  return p.id;
}

// Đọc user id trong challenge (kể cả đã hết hạn tối đa vài phút) để gửi lại mã mà không bắt nhập lại mật khẩu
function readChallengeUser(challenge, purpose) {
  let p;
  try { p = jwt.verify(challenge || '', process.env.JWT_SECRET, { ignoreExpiration: true }); } catch { throw new AppError('Yêu cầu xác minh không hợp lệ', 400); }
  if (p.purpose !== purpose) throw new AppError('Yêu cầu xác minh không hợp lệ', 400);
  if (p.exp && Date.now() / 1000 - p.exp > 30 * 60) throw new AppError('Phiên xác minh đã quá hạn, hãy đăng nhập lại', 401);
  return p.id;
}

module.exports = { issueChallenge, verifyChallenge, readChallengeUser, maskEmail, codeFor };
