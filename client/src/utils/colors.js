// Màu dùng chung theo MỘT màu thương hiệu (xanh dương). Màu khác chỉ dùng cho trạng thái có ý nghĩa
// (thành công / cảnh báo / lỗi), không dùng để trang trí.
//
// Thẻ kỹ năng luôn cùng một tông xanh nhạt; ảnh đại diện mỗi người một sắc độ khác nhau
// (cố định theo tên) để vẫn phân biệt được mà không bị "nhiều màu".
export const CHIP = 'bg-primary-50 text-primary-700 ring-primary-200';

const AVATAR_SHADES = [
  'from-primary-500 to-primary-700',
  'from-sky-500 to-primary-600',
  'from-primary-400 to-primary-600',
  'from-primary-600 to-primary-800',
  'from-sky-400 to-primary-700',
];

const hash = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

export const colorFor = (key) => ({
  chip: CHIP,
  grad: AVATAR_SHADES[hash(String(key || '')) % AVATAR_SHADES.length],
});
