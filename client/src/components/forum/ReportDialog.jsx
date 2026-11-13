import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import { apiMessage } from '@/components/forum/ForumParts';

export const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam / quảng cáo', hint: 'Quảng cáo, chèn liên kết, đăng lặp lại' },
  { value: 'OFFENSIVE', label: 'Ngôn từ xúc phạm', hint: 'Công kích cá nhân, thô tục, phân biệt đối xử' },
  { value: 'ILLEGAL', label: 'Vi phạm pháp luật / lừa đảo', hint: 'Lừa đảo, đa cấp, nội dung bất hợp pháp' },
  { value: 'OTHER', label: 'Lý do khác', hint: 'Mô tả ngắn gọn ở ô bên dưới' },
];
export const REASON_LABEL = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));

// Hộp thoại báo cáo một bài viết vi phạm cho quản trị viên
export default function ReportDialog({ postId, onClose, onDone }) {
  useEscapeKey(onClose);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const send = useMutation({
    mutationFn: () => forumApi.reportPost(postId, { reason, note: note.trim() || undefined }),
    onSuccess: (res) => { toast.success(res.data.message); onDone?.(); onClose(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa gửi được báo cáo')),
  });
  const valid = !!reason && (reason !== 'OTHER' || note.trim().length > 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Báo cáo bài viết"
    >
      <form
        className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-fade-in"
        onSubmit={(e) => { e.preventDefault(); if (valid && !send.isPending) send.mutate(); }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <span className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0"><Icon name="flag" className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 leading-tight">Báo cáo bài viết</h2>
            <p className="text-xs text-slate-500">Quản trị viên sẽ xem xét. Báo cáo của bạn được giữ kín.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Lý do báo cáo</p>
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className={`flex items-start gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer transition-colors ${reason === r.value ? 'border-primary-400 bg-primary-50/60' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
              <input type="radio" name="report-reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="mt-1 accent-primary-600" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800">{r.label}</span>
                <span className="block text-xs text-slate-500">{r.hint}</span>
              </span>
            </label>
          ))}
          <textarea
            className="input-field min-h-[5rem] resize-y !mt-3"
            placeholder={reason === 'OTHER' ? 'Mô tả lý do (bắt buộc)' : 'Ghi chú thêm (không bắt buộc)'}
            value={note}
            maxLength={500}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Hủy</button>
          <button type="submit" disabled={!valid || send.isPending} className="btn-danger text-sm disabled:opacity-60">{send.isPending ? 'Đang gửi...' : 'Gửi báo cáo'}</button>
        </div>
      </form>
    </div>,
    document.body
  );
}
