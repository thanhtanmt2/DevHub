import { Outlet } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        © 2026 DevHub – Nền Tảng Kết Nối Nhân Sự IT
      </footer>
    </div>
  );
}
