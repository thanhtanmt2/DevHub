import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '@/api/authApi';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card text-center max-w-md">
        {status === 'loading' && <p className="text-gray-500">Đang xác thực...</p>}
        {status === 'success' && (<>
          <div className="text-5xl mb-3">✅</div>
          <h2 className="font-semibold text-lg mb-2">Xác thực thành công!</h2>
          <p className="text-gray-500 text-sm mb-4">Tài khoản của bạn đã được kích hoạt.</p>
          <Link to="/login" className="btn-primary">Đăng nhập ngay</Link>
        </>)}
        {status === 'error' && (<>
          <div className="text-5xl mb-3">❌</div>
          <h2 className="font-semibold text-lg mb-2">Xác thực thất bại</h2>
          <p className="text-gray-500 text-sm">Link không hợp lệ hoặc đã hết hạn.</p>
        </>)}
      </div>
    </div>
  );
}
