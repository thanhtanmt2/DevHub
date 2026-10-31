import Logo from '@/components/common/Logo';

// Khung chung cho các trang xác thực đứng riêng (quên / đặt lại mật khẩu, xác thực email):
// logo DevHub phía trên + thẻ nội dung ở giữa, cùng phong cách với trang chủ.
export default function AuthPageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 via-white to-white px-4 py-10">
      <Logo variant="dark" size="lg" className="mb-7" />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
