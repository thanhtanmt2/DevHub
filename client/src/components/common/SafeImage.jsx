import { useState, useEffect } from 'react';

// Ảnh có ảnh thay thế: khi file không tải được (đã bị xóa, sai đường dẫn...) thì hiện `fallback`
// thay vì icon ảnh vỡ kèm chữ alt. `fallback` có thể là null để ẩn ảnh.
export default function SafeImage({ src, alt = '', fallback = null, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) return fallback;
  return <img src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}
