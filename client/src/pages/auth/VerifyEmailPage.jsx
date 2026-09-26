import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '@/api/authApi';

export default function VerifyEmailPage() {
  // trích xuất chuỗi token từ URL lưu vào biến token
  const { token } = useParams();
  // trạng thái ban đầu là loading 
  const [status, setStatus] = useState('loading');
  const calledOnce = useRef(false);

  useEffect(() => {
    if (calledOnce.current) return;
    calledOnce.current = true;

    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  // form được bật lên khi người dùng nhấp vào link xác thực email 
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
