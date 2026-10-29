// Dữ liệu & hàm dùng chung cho tin tuyển dụng (Việc làm doanh nghiệp + Dự án thời vụ)
import { timeAgo } from '@/utils/timeAgo';

// Các thành phố lớn đứng đầu danh sách, còn lại xếp theo vần
const TOP_CITIES = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
const OTHER_PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định',
  'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An',
  'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];
export const PROVINCES = [...TOP_CITIES, ...OTHER_PROVINCES];
export const LOCATION_ANYWHERE = 'REMOTE_ANY'; // "Toàn quốc / Remote"

export const WORK_TYPE_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', REMOTE: 'Remote', FREELANCE: 'Freelance' };

export const EXPERIENCE_LABELS = {
  NONE: 'Không yêu cầu',
  UNDER_1: 'Dưới 1 năm',
  Y1_2: '1 – 2 năm',
  Y2_5: '2 – 5 năm',
  OVER_5: 'Trên 5 năm',
};

export const LEVEL_LABELS = {
  INTERN: 'Thực tập sinh',
  FRESHER: 'Fresher',
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Team Lead',
  MANAGER: 'Quản lý',
};

// Khoảng lương để lọc (đơn vị: VNĐ/tháng)
export const SALARY_RANGES = [
  { key: '', label: 'Mức lương', from: '', to: '' },
  { key: 'u10', label: 'Dưới 10 triệu', from: '', to: 10000000 },
  { key: '10-20', label: '10 – 20 triệu', from: 10000000, to: 20000000 },
  { key: '20-30', label: '20 – 30 triệu', from: 20000000, to: 30000000 },
  { key: '30-50', label: '30 – 50 triệu', from: 30000000, to: 50000000 },
  { key: 'o50', label: 'Trên 50 triệu', from: 50000000, to: '' },
];

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

// 25.000.000 → "25 triệu"; số lẻ hiển thị gọn như "12,5 triệu"
const toMillion = (n) => {
  const m = Number(n) / 1000000;
  if (!Number.isFinite(m)) return '';
  return `${Number.isInteger(m) ? m : m.toFixed(1).replace('.', ',')} triệu`;
};

// Mức lương dạng gọn kiểu TopCV: "25 – 40 triệu", "Từ 20 triệu", "Thỏa thuận"
export function formatSalaryShort(min, max) {
  if (!min && !max) return 'Thỏa thuận';
  if (min && max) {
    const a = Number(min) / 1000000;
    const b = Number(max) / 1000000;
    if (a >= 1 && b >= 1) return `${Number.isInteger(a) ? a : a.toFixed(1).replace('.', ',')} – ${toMillion(max)}`;
    return `${fmt(min)} – ${fmt(max)}đ`;
  }
  if (min) return `Từ ${Number(min) >= 1000000 ? toMillion(min) : `${fmt(min)}đ`}`;
  return `Đến ${Number(max) >= 1000000 ? toMillion(max) : `${fmt(max)}đ`}`;
}

// Mức lương đầy đủ: "25.000.000 – 40.000.000đ"
export function formatSalary(min, max) {
  if (!min && !max) return 'Thỏa thuận';
  if (min && max) return `${fmt(min)} – ${fmt(max)}đ`;
  if (min) return `Từ ${fmt(min)}đ`;
  return `Đến ${fmt(max)}đ`;
}

export const formatMoney = (n) => (n ? `${fmt(n)}đ` : 'Thỏa thuận');

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '');

// Hạn nộp hồ sơ: còn bao nhiêu ngày / đã hết hạn
export function deadlineInfo(deadline) {
  if (!deadline) return { key: 'none', text: 'Không giới hạn', expired: false };
  const end = new Date(deadline).getTime();
  if (Number.isNaN(end)) return { key: 'none', text: 'Không giới hạn', expired: false };
  const diff = end - Date.now();
  if (diff < 0) return { key: 'expired', text: 'Đã hết hạn', expired: true };
  const days = Math.ceil(diff / 86400000);
  if (days <= 1) return { key: 'soon', text: 'Hết hạn hôm nay', expired: false };
  if (days <= 7) return { key: 'soon', text: `Còn ${days} ngày`, expired: false };
  return { key: 'ok', text: `Còn ${days} ngày`, expired: false };
}

// "26/9/2026 (3 ngày trước)"; quá 7 ngày chỉ hiện ngày đăng
export function postedText(value) {
  if (!value) return '';
  const ago = timeAgo(value);
  return !ago || ago.includes('/') ? formatDate(value) : `${formatDate(value)} (${ago})`;
}

// Địa điểm hiển thị gọn: "TP. Hồ Chí Minh" thay vì cả địa chỉ dài
export const shortLocation = (loc) => (loc ? String(loc).split(',').pop().trim() : '');

// Trạng thái tin tuyển dụng (dùng ở trang quản lý của nhà tuyển dụng)
export const JOB_STATUS_META = {
  DRAFT: { label: 'Bản nháp', cls: 'bg-gray-100 text-gray-700' },
  PENDING_APPROVAL: { label: 'Chờ Admin duyệt', cls: 'bg-amber-100 text-amber-800' },
  OPEN: { label: 'Đang tuyển', cls: 'bg-emerald-100 text-emerald-800' },
  HIDDEN: { label: 'Bị từ chối', cls: 'bg-rose-100 text-rose-700' },
  CLOSED: { label: 'Đã đóng', cls: 'bg-slate-200 text-slate-600' },
};
