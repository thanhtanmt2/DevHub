import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '@/api/authApi';
import { IconBadge } from '@/components/common/Icon';
import AuthPageShell from '@/components/common/AuthPageShell';

export default function VerifyEmailPage() {
  // trích xuất chuỗi token từ URL lưu vào biến token
  const { token } = useParams();
  // trạng thái ban đầu là loading
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const calledOnce = useRef(false);

  useEffect(() => {
    if (calledOnce.current) return;
    calledOnce.current = true;

    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setErrorMessage(err.response?.data?.message || 'Link không hợp lệ hoặc đã hết hạn.');
        setStatus('error');
      });
  }, [token]);

  // Link hết hạn / đã dùng rồi: nhập email để nhận lại link mới
  const handleResend = async (e) => {
    e.preventDefault();
    setResending(true);
    try {
      const { data } = await authApi.resendVerification(email.trim());
      toast.success(data.message || 'Đã gửi lại email xác thực');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chưa gửi được email, vui lòng thử lại sau');
    } finally {
      setResending(false);
    }
  };

  // form được bật lên khi người dùng nhấp vào link xác thực email
  return (
    <AuthPageShell>
      <div className="card text-center">
        {status === 'loading' && <p className="text-gray-500">Đang xác thực...</p>}
        {status === 'success' && (<>
          <IconBadge name="verified" size="lg" tone="green" className="mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-2">Xác thực thành công!</h2>
          <p className="text-gray-500 text-sm mb-4">Tài khoản của bạn đã được kích hoạt.</p>
          <Link to="/login" className="btn-primary">Đăng nhập ngay</Link>
        </>)}
        {status === 'error' && (<>
          <IconBadge name="xCircle" size="lg" tone="red" className="mx-auto mb-3" />
          <h2 className="font-semibold text-lg mb-2">Xác thực thất bại</h2>
          <p className="text-gray-500 text-sm mb-5">{errorMessage}</p>
          <form onSubmit={handleResend} className="space-y-3 text-left">
            <label className="block text-sm font-medium text-gray-700">Nhận lại link xác thực qua email</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" disabled={resending} className="btn-primary w-full">
              {resending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            Đã xác thực rồi?{' '}
            <Link to="/login" className="text-primary-700 font-medium hover:underline">Đăng nhập</Link>
          </p>
        </>)}
      </div>
    </AuthPageShell>
  );
}
