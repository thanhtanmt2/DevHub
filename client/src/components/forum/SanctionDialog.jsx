import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import Avatar from '@/components/common/Avatar';
import Icon from '@/components/common/Icon';
import { REASON_LABEL } from '@/components/forum/ReportDialog';
import { apiMessage } from '@/components/forum/ForumParts';
import useEscapeKey from '@/hooks/useEscapeKey';

const Option = ({ checked, disabled, onChange, title, hint, danger = false }) => (
  <label className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${checked ? (danger ? 'border-red-300 bg-red-50/60' : 'border-primary-400 bg-primary-50/60') : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className={`mt-1 ${danger ? 'accent-red-600' : 'accent-primary-600'}`} />
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-slate-800">{title}</span>
      <span className="block text-xs text-slate-500">{hint}</span>
    </span>
  </label>
);

// Hộp thoại xử phạt người đăng bài bị báo cáo (Admin): cảnh cáo, xóa bài, khóa tài khoản. Đủ số lần cảnh cáo thì tài khoản tự bị khóa.
export default function SanctionDialog({ report, maxWarnings, onClose, onDone }) {
  useEscapeKey(onClose);
  const author = report.post.author;
  const used = author?.warnings || 0;
  const [warn, setWarn] = useState(!!author);
  const [del, setDel] = useState(false);
  const [lock, setLock] = useState(false);
  const [message, setMessage] = useState(`Bài viết vi phạm nội quy diễn đàn (${REASON_LABEL[report.reason] || report.reason_label}). Vui lòng tuân thủ nội quy.`);

  const doWarn = warn || lock;
  const next = used + 1;
  const reachesLimit = doWarn && next >= maxWarnings;
  const willLock = lock || reachesLimit;
  const valid = (doWarn || del) && (!doWarn || message.trim().length >= 5);
  const submitLabel = willLock ? 'Cảnh cáo và khóa tài khoản' : doWarn ? (del ? 'Cảnh cáo và xóa bài' : 'Cảnh cáo') : 'Xóa bài viết';

  const send = useMutation({
    mutationFn: () => forumApi.sanctionReport(report.id, { warn: doWarn, delete_post: del, lock, message: message.trim() }),
    onSuccess: (res) => { toast.success(res.data.message); onDone?.(); onClose(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa xử lý được vi phạm')),
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Xử lý vi phạm"
    >
      <form
        className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-fade-in"
        onSubmit={(e) => { e.preventDefault(); if (valid && !send.isPending) send.mutate(); }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0"><Icon name="shield" className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 leading-tight">Xử lý vi phạm</h2>
            <p className="text-xs text-slate-500 truncate">Lý do báo cáo: {REASON_LABEL[report.reason] || report.reason_label}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {author ? (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5">
              <Avatar name={author.full_name} src={author.avatar_url} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 leading-tight truncate">{author.full_name}</p>
                <p className="text-xs text-slate-500">Đã bị cảnh cáo <strong className={used > 0 ? 'text-red-600' : 'text-slate-700'}>{used}/{maxWarnings}</strong> lần{author.locked ? ' · tài khoản đang bị khóa' : ''}</p>
              </div>
            </div>
          ) : <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">Tài khoản người đăng đã bị xóa, chỉ có thể gỡ bài viết.</p>}

          <Option
            checked={doWarn} disabled={!author || lock} onChange={setWarn}
            title="Cảnh cáo người đăng"
            hint={<>Lần cảnh cáo thứ {next}/{maxWarnings}. Đủ {maxWarnings} lần thì tài khoản tự động bị khóa.{reachesLimit && !lock && <strong className="text-red-600"> Lần này đủ {maxWarnings} lần nên tài khoản sẽ bị khóa.</strong>}</>}
          />
          <Option checked={del} onChange={setDel} title="Xóa bài viết" hint="Gỡ bài khỏi diễn đàn. Nếu là bài gốc thì xóa cả chủ đề và các bài trả lời." />
          <Option
            danger checked={lock} disabled={!author} onChange={setLock}
            title="Khóa tài khoản ngay"
            hint="Dùng cho vi phạm nghiêm trọng. Người này không đăng nhập được cho tới khi quản trị viên mở khóa ở trang Quản lý người dùng."
          />

          {doWarn && (
            <div>
              <label htmlFor="sanction-message" className="block text-sm font-semibold text-slate-700 mb-1.5">Lời nhắn gửi người đăng</label>
              <textarea id="sanction-message" className="input-field min-h-[5rem] resize-y" value={message} maxLength={500} onChange={(e) => setMessage(e.target.value)} />
              <p className="mt-1 text-xs text-slate-400 text-right">{message.length}/500 · người đăng nhận qua thông báo và email</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Hủy</button>
          <button type="submit" disabled={!valid || send.isPending} className="btn-danger text-sm">{send.isPending ? 'Đang xử lý...' : submitLabel}</button>
        </div>
      </form>
    </div>,
    document.body
  );
}
