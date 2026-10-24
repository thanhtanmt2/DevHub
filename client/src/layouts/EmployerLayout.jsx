import DashboardShell from '@/components/common/DashboardShell';

const navItems = [
  { to: '/employer', label: 'Tổng quan', icon: 'home', end: true },
  { to: '/employer/company', label: 'Hồ sơ doanh nghiệp', icon: 'building' },
  { to: '/employer/jobs', label: 'Tin tuyển dụng & hồ sơ', icon: 'briefcase' },
  { to: '/employer/candidates', label: 'Tìm ứng viên', icon: 'search' },
];

export default function EmployerLayout() {
  return <DashboardShell title="Nhà tuyển dụng" items={navItems} />;
}
