import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Mật khẩu không khớp');
    setLoading(true);
    try {
      await authApi.resetPassword(token, form.password);
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Token không hợp lệ'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required className="input-field" placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <input type="password" required className="input-field" placeholder="Xác nhận mật khẩu"
            value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
