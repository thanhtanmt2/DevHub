import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirmPassword: '', role: 'CANDIDATE' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp');
    if (form.password.length < 8) return toast.error('Mật khẩu tối thiểu 8 ký tự');
    setLoading(true);
    try {
      await authApi.register({ full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card text-center max-w-md w-full">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Kiểm tra email của bạn</h2>
          <p className="text-gray-500">Chúng tôi đã gửi link xác thực đến <strong>{form.email}</strong>. Vui lòng kiểm tra hộp thư và xác thực tài khoản.</p>
          <Link to="/login" className="btn-primary mt-6 inline-block">Về trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">DevHub</h1>
          <p className="text-gray-500 mt-2">Tạo tài khoản mới</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input type="text" required className="input-field" placeholder="Nguyễn Văn A"
                value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tôi là</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="CANDIDATE">Người tìm việc / Freelancer</option>
                <option value="EMPLOYER">Nhà tuyển dụng / Doanh nghiệp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input type="password" required className="input-field" placeholder="Tối thiểu 8 ký tự"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input type="password" required className="input-field" placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Đã có tài khoản? <Link to="/login" className="text-primary-600 hover:underline font-medium">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
