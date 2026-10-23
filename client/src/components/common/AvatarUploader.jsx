import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/authApi';
import { uploadApi } from '@/api/uploadApi';

const MAX_SIZE = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Ảnh đại diện có nút đổi ảnh (dấu bút chì) và nút gỡ ảnh. Dùng cho mọi loại tài khoản.
// `light`: nút "Gỡ ảnh" màu trắng khi đặt trên nền xanh.
export default function AvatarUploader({ size = 'xl', className = '', light = false }) {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const save = async (url) => {
    const res = await authApi.updateAvatar(url);
    updateUser({ avatar_url: res.data.data.avatar_url });
    qc.invalidateQueries({ queryKey: ['candidate-profile'] });
    qc.invalidateQueries({ queryKey: ['employer-company'] }); // nhà tuyển dụng: ảnh đại diện = logo công ty
    return res.data.message;
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng một file
    if (!file) return;
    if (!TYPES.includes(file.type)) return toast.error('Chỉ nhận ảnh JPG, PNG, GIF hoặc WEBP');
    if (file.size > MAX_SIZE) return toast.error('Ảnh quá lớn, tối đa 5MB');
    setBusy(true);
    try {
      const up = await uploadApi.uploadImage(file);
      toast.success(await save(up.data.data.url));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật ảnh đại diện');
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      toast.success(await save(null));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gỡ ảnh đại diện');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative">
        {user?.avatar_url ? (
          // Có ảnh: bấm vào ảnh để xem phóng to
          <Avatar name={user?.full_name || user?.email} src={user.avatar_url} size={size} className={className} zoomable />
        ) : (
          // Chưa có ảnh: bấm vào chữ cái để chọn ảnh
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} title="Bấm để thêm ảnh đại diện" aria-label="Thêm ảnh đại diện" className="rounded-full">
            <Avatar name={user?.full_name || user?.email} size={size} className={className} />
          </button>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          title="Đổi ảnh đại diện"
          aria-label="Đổi ảnh đại diện"
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-primary-600 shadow-md ring-1 ring-slate-200 flex items-center justify-center hover:bg-primary-50 disabled:opacity-60 transition-colors"
        >
          {busy
            ? <span className="w-4 h-4 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
            : <Icon name="pencil" className="w-4 h-4" />}
        </button>
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/*" className="hidden" onChange={onFile} />
      </div>
      {user?.avatar_url && (
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          className={`text-xs hover:underline disabled:opacity-60 ${light ? 'text-white' : 'text-slate-500 hover:text-red-600'}`}
        >
          Gỡ ảnh
        </button>
      )}
    </div>
  );
}
