import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';
import { IconBadge } from '@/components/common/Icon';
import AuthPageShell from '@/components/common/AuthPageShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch { toast.error('Có lỗi xảy ra, vui lòng thử lại'); }
    finally { setLoading(false); }
  };

  if (sent) return (
    <AuthPageShell>
      <div className="card text-center">
        <IconBadge name="mail" size="lg" tone="blue" className="mx-auto mb-3" />
        <h2 className="font-semibold text-lg mb-2">Email đã được gửi</h2>
        <p className="text-gray-500 text-sm">Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.</p>
        <Link to="/login" className="btn-primary mt-4">Về đăng nhập</Link>
      </div>
    </AuthPageShell>
  );

  return (
    <AuthPageShell>
      <div className="card">
        <h2 className="text-xl font-semibold mb-1">Quên mật khẩu</h2>
        <p className="text-gray-500 text-sm mb-5">Nhập email để nhận link đặt lại mật khẩu.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required className="input-field" placeholder="Email của bạn"
            value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm"><Link to="/login" className="text-primary-700 hover:underline">← Quay lại đăng nhập</Link></p>
      </div>
    </AuthPageShell>
  );
}
