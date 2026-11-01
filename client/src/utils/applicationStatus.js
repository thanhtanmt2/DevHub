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

export const APPLICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  VIEWED: 'bg-primary-100 text-primary-700',
  INTERVIEW: 'bg-sky-100 text-sky-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVIEWING: 'bg-primary-100 text-primary-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
};
