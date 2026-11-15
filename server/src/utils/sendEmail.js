const nodemailer = require('nodemailer');

// Gửi email qua một trong hai đường:
//  1) API HTTPS của Brevo — đặt BREVO_API_KEY (+ EMAIL_FROM là địa chỉ đã xác minh ở Brevo). Dùng khi deploy trên Railway
//     vì các cổng SMTP (25 / 465 / 587) bị chặn ở gói không phải Pro.
//  2) SMTP (Gmail...) — đặt EMAIL_HOST / EMAIL_PORT / EMAIL_USER / EMAIL_PASS. Dùng khi chạy ở máy.
// Gửi lỗi thì ném lỗi, nơi gọi tự quyết định báo người dùng hay chỉ ghi log.
const BREVO_URL = () => process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email';

const isConfigured = () => !!process.env.BREVO_API_KEY || (!!process.env.EMAIL_USER && !!process.env.EMAIL_PASS);

const fromAddress = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

async function sendViaBrevo({ to, subject, html }) {
  const recipients = []
    .concat(to)
    .flatMap((t) => String(t).split(','))
    .map((t) => t.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
  if (!fromAddress()) throw new Error('Chưa cấu hình EMAIL_FROM (địa chỉ gửi đã xác minh ở Brevo)');
  const res = await fetch(BREVO_URL(), {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { name: 'DevHub', email: fromAddress() }, to: recipients, subject, htmlContent: html }),
  });
  if (!res.ok) throw new Error(`Brevo trả lỗi ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

async function sendViaSmtp({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  await transporter.sendMail({
    from: `"DevHub" <${fromAddress()}>`,
    to,
    subject,
    html,
  });
}

const sendEmail = async (mail) => (process.env.BREVO_API_KEY ? sendViaBrevo(mail) : sendViaSmtp(mail));

sendEmail.isConfigured = isConfigured;

module.exports = sendEmail;
