import { Link } from 'react-router-dom';

// Khung chung cho các trang xác thực đứng riêng (quên / đặt lại mật khẩu, xác thực email):
// logo DevHub phía trên + thẻ nội dung ở giữa, cùng phong cách với trang chủ.
export default function AuthPageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-white px-4 py-10">
      <Link
        to="/"
        aria-label="DevHub — Trang chủ"
        className="inline-flex items-center bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 mb-6"
      >
        <img
          src="/logo-devhub.png"
          alt="DevHub Since 2026"
          className="h-11 w-auto object-contain"
        />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
