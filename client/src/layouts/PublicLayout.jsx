import { Outlet, Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold text-sm">D</span>
            <span>© 2026 <strong className="text-slate-700">DevHub</strong> – Nền tảng kết nối nhân sự IT</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/projects" className="hover:text-primary-600 transition-colors">Dự án thời vụ</Link>
            <Link to="/jobs" className="hover:text-primary-600 transition-colors">Tuyển dụng công ty</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
