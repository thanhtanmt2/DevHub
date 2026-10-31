// Thông tin liên hệ / hỗ trợ hiển thị ở thanh trên cùng, footer và nút hỗ trợ nổi.
// Email, hotline, Zalo dưới đây là DỮ LIỆU MẪU cho bản demo — thay bằng thông tin thật khi triển khai (chỉ cần sửa ở đây).
export const SUPPORT = {
  email: 'support@devhub.vn',
  hotline: '0900 000 001',
  techHotline: '0900 000 002',
  zalo: '0900000001', // số điện thoại gắn với tài khoản Zalo hỗ trợ
  hours: 'Thứ 2 – Thứ 6: 8h00 – 17h30',
};

export const telHref = (n) => `tel:${String(n).replace(/\s+/g, '')}`;
export const zaloHref = (n) => `https://zalo.me/${String(n).replace(/\D/g, '')}`;
export const mailHref = (e, subject) => `mailto:${e}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
