import DashboardShell from '@/components/common/DashboardShell';

const navItems = [
  { to: '/candidate', label: 'Tổng quan', icon: 'home', end: true },
  { to: '/candidate/profile', label: 'Hồ sơ năng lực', icon: 'user' },
  { to: '/candidate/applications', label: 'Hồ sơ ứng tuyển', icon: 'clipboard' },
  { to: '/candidate/workspaces', label: 'Dự án của tôi', icon: 'workspace' },
];

export default function CandidateLayout() {
  return <DashboardShell title="Ứng viên" items={navItems} />;
}
