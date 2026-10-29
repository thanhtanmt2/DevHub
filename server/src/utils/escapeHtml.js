// Mọi dữ liệu do người dùng nhập (tên, ghi chú, tên công ty, tiêu đề tin...) phải qua đây trước khi chèn vào email HTML,
// nếu không người gửi có thể chèn thẻ HTML / liên kết giả mạo vào thư mà người khác nhận được.
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Chỉ cho phép liên kết http(s) (chặn javascript:, data:...) rồi escape để nhúng vào thuộc tính href; không hợp lệ thì trả chuỗi rỗng
const safeHref = (url) => {
  const u = String(url ?? '').trim();
  return /^https?:\/\//i.test(u) ? escapeHtml(u) : '';
};

module.exports = { escapeHtml, safeHref };
