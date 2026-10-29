// Bỏ emoji khỏi chuỗi do server tạo (mô tả nhật ký, nội dung thông báo...) — kể cả dữ liệu cũ đã lưu trong
// database — để giao diện đồng nhất. Chỉ dùng cho văn bản hiển thị, không dùng cho dữ liệu người dùng nhập.
export function stripEmoji(text) {
  return String(text ?? '')
    .replace(/[\p{Extended_Pictographic}‍️]/gu, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}
