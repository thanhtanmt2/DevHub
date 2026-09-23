import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Quản lý người dùng' },
  { to: '/admin/skills', label: 'Danh mục kỹ năng' },
  { to: '/admin/projects', label: 'Dự án nội bộ' },
  { to: '/admin/payments', label: 'Thanh toán' },
  { to: '/admin/stats', label: 'Thống kê' },
  { to: '/admin/logs', label: 'Nhật ký hệ thống' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        <aside className="w-60 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin Panel</p>
            <nav className="space-y-1">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
