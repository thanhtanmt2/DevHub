import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '@/api/authApi';
import { IconBadge } from '@/components/common/Icon';
import AuthPageShell from '@/components/common/AuthPageShell';

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
          <p className="text-gray-500 text-sm">Link không hợp lệ hoặc đã hết hạn.</p>
        </>)}
      </div>
    </AuthPageShell>
  );
}
