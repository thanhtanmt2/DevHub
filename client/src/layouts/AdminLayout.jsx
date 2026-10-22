import DashboardShell from '@/components/common/DashboardShell';

const navItems = [
  { to: '/admin', label: 'Tổng quan', icon: 'home', end: true },
  { to: '/admin/users', label: 'Quản lý người dùng', icon: 'users' },
  { to: '/admin/companies', label: 'Xác thực doanh nghiệp', icon: 'verified' },
  { to: '/admin/jobs', label: 'Duyệt tin tuyển dụng', icon: 'clipboard' },
  { to: '/admin/skills', label: 'Danh mục kỹ năng', icon: 'skills' },
  { to: '/admin/projects', label: 'Dự án nội bộ', icon: 'folder' },
  { to: '/admin/payments', label: 'Thanh toán', icon: 'card' },
  { to: '/admin/stats', label: 'Thống kê', icon: 'chart' },
  { to: '/admin/logs', label: 'Nhật ký hệ thống', icon: 'document' },
];

export default function AdminLayout() {
  return <DashboardShell title="Quản trị hệ thống" items={navItems} />;
}
