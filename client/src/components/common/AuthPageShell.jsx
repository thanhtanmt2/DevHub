import { Link } from 'react-router-dom';

// Khung chung cho các trang xác thực đứng riêng (quên / đặt lại mật khẩu, xác thực email):
// logo DevHub phía trên + thẻ nội dung ở giữa, cùng phong cách với trang chủ.
export default function AuthPageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-white px-4 py-10">
      <Link to="/" className="flex items-center gap-2.5 mb-6">
        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-extrabold text-xl shadow-sm">
          D
        </span>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          Dev<span className="text-primary-600">Hub</span>
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
