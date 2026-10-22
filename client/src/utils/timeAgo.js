// Thời điểm tương đối bằng tiếng Việt: "Vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước".
// Quá 7 ngày thì hiện ngày tháng đầy đủ.
export function timeAgo(value) {
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return '';
  const seconds = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(t).toLocaleDateString('vi-VN');
}
