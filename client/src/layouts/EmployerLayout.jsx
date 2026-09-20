import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';

const navItems = [
  { to: '/employer', label: 'Dashboard', end: true },
  { to: '/employer/jobs', label: 'Tin tuyển dụng' },
  { to: '/employer/candidates', label: 'Tìm ứng viên' },
  { to: '/employer/applications', label: 'Hồ sơ ứng tuyển' },
];

export default function EmployerLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        <aside className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  );
}
