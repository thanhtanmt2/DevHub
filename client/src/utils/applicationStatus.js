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

export const APPLICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  VIEWED: 'bg-blue-100 text-blue-700',
  INTERVIEW: 'bg-sky-100 text-sky-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVIEWING: 'bg-primary-100 text-primary-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
};
