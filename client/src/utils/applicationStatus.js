// Trạng thái hồ sơ ứng tuyển dùng chung (nhãn tiếng Việt + màu)
export const APPLICATION_STATUS_LABELS = {
  PENDING: 'Chờ xem xét',
  VIEWED: 'Đã xem',
  INTERVIEW: 'Phỏng vấn',
  HIRED: 'Trúng tuyển',
  REJECTED: 'Không phù hợp',
  REVIEWING: 'Đang xét duyệt',
  ACCEPTED: 'Trúng tuyển dự án',
};

// Trạng thái hồ sơ nhìn từ phía nhà tuyển dụng
export const EMPLOYER_APPLICATION_STATUS = {
  PENDING: { label: 'Chờ xem', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  VIEWED: { label: 'Đã xem', cls: 'bg-primary-50 text-primary-700 border-primary-200' },
  INTERVIEW: { label: 'Phỏng vấn', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  HIRED: { label: 'Đã tuyển', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Từ chối', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

// Trạng thái hồ sơ ứng tuyển dự án thời vụ (dùng ở trang quản lý dự án & hồ sơ ứng viên)
export const PROJECT_APPLICATION_STATUS = {
  PENDING:   { label: 'Chờ duyệt',      cls: 'bg-amber-50 text-amber-700 border-amber-200', badgeCls: 'bg-yellow-100 text-yellow-700' },
  REVIEWING: { label: 'Đang xét duyệt', cls: 'bg-primary-50 text-primary-700 border-primary-200', badgeCls: 'bg-primary-100 text-primary-700' },
  INTERVIEW: { label: 'Mời phỏng vấn',  cls: 'bg-sky-50 text-sky-700 border-sky-200', badgeCls: 'bg-sky-100 text-sky-700' },
  ACCEPTED:  { label: 'Trúng tuyển',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', badgeCls: 'bg-green-100 text-green-700' },
  REJECTED:  { label: 'Từ chối',        cls: 'bg-rose-50 text-rose-700 border-rose-200', badgeCls: 'bg-red-100 text-red-700' },
};

export const APPLICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  VIEWED: 'bg-primary-100 text-primary-700',
  INTERVIEW: 'bg-sky-100 text-sky-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVIEWING: 'bg-primary-100 text-primary-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
};

// Bộ 5 tiêu chí chuẩn đánh giá phỏng vấn ứng viên dự án IT (thang điểm 1–10)
export const INTERVIEW_CRITERIA = [
  {
    key: 'technical',
    label: 'Kỹ năng chuyên môn (Technical)',
    desc: 'Kiến thức nền tảng, công nghệ và kỹ năng lập trình theo yêu cầu vị trí',
  },
  {
    key: 'problem_solving',
    label: 'Tư duy giải quyết vấn đề',
    desc: 'Khả năng phân tích bài toán, xử lý tình huống và tối ưu giải pháp',
  },
  {
    key: 'experience',
    label: 'Kinh nghiệm thực tế',
    desc: 'Kinh nghiệm làm dự án thực tế và khả năng bắt nhịp công việc',
  },
  {
    key: 'communication',
    label: 'Giao tiếp & Thái độ làm việc',
    desc: 'Khả năng trình bày, phối hợp nhóm (teamwork) và tinh thần trách nhiệm',
  },
  {
    key: 'culture_fit',
    label: 'Độ phù hợp với dự án',
    desc: 'Sự phù hợp với tiến độ, phạm vi công việc và cam kết thời gian',
  },
];

// Kết luận phỏng vấn từ Người phỏng vấn
export const INTERVIEW_RESULT_META = {
  PASS: {
    label: 'Đạt (Tuyển vào dự án)',
    shortLabel: 'Đạt phỏng vấn',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    badgeCls: 'bg-emerald-600 text-white',
  },
  CONSIDER: {
    label: 'Cân nhắc thêm',
    shortLabel: 'Cân nhắc thêm',
    cls: 'bg-amber-50 text-amber-800 border-amber-300',
    badgeCls: 'bg-amber-500 text-white',
  },
  REJECT: {
    label: 'Không đạt (Từ chối)',
    shortLabel: 'Không đạt PV',
    cls: 'bg-rose-50 text-rose-800 border-rose-300',
    badgeCls: 'bg-rose-600 text-white',
  },
};

// Các khung giờ phỏng vấn chuẩn trong ngày (dùng chung cho Admin đặt lịch & Ứng viên tự chọn giờ)
export const INTERVIEW_SLOT_GROUPS = [
  { label: 'Buổi sáng', slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'] },
  { label: 'Buổi chiều', slots: ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'] },
  { label: 'Buổi tối', slots: ['19:00', '19:30', '20:00', '20:30'] },
];

export const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export function toLocalDateInput(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toLocalTimeInput(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

export function addMinutesToTimeStr(timeStr, minutes) {
  if (!timeStr || !timeStr.includes(':')) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const endH = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const endM = String(total % 60).padStart(2, '0');
  return `${endH}:${endM}`;
}
