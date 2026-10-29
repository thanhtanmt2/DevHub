import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconBadge } from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';

// Hộp thoại xác nhận dùng chung, thay cho window.confirm() của trình duyệt.
//
//   const confirm = useConfirm();
//   if (await confirm({ title: 'Xóa task', message: 'Xóa task này?', confirmText: 'Xóa', tone: 'danger' })) { ... }
//
// Truyền một chuỗi cũng được: await confirm('Bạn có chắc không?')
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { title, message, confirmText, cancelText, tone, resolve }
  const currentRef = useRef(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    const opts = typeof options === 'string' ? { message: options } : (options || {});
    currentRef.current?.resolve(false); // đang có hộp thoại khác mở thì coi như đã hủy
    const next = { ...opts, resolve };
    currentRef.current = next;
    setDialog(next);
  }), []);

  const close = useCallback((result) => {
    const current = currentRef.current;
    currentRef.current = null;
    setDialog(null);
    current?.resolve(result);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {dialog && createPortal(<ConfirmModal dialog={dialog} onClose={close} />, document.body)}
    </ConfirmContext.Provider>
  );
}

function ConfirmModal({ dialog, onClose }) {
  const { title = 'Xác nhận', message, confirmText = 'Đồng ý', cancelText = 'Hủy', tone = 'primary' } = dialog;
  const danger = tone === 'danger';
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);

  // Hành động nguy hiểm: mặc định focus nút Hủy để tránh lỡ tay bấm Enter
  useEffect(() => {
    (danger ? cancelRef : confirmRef).current?.focus();
  }, [danger]);

  useEscapeKey(() => onClose(false));

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-900/50 flex items-center justify-center p-4 animate-fade-in"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(false); }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-slide-up"
      >
        <div className="flex gap-4">
          <IconBadge name={danger ? 'alert' : 'info'} tone={danger ? 'red' : 'blue'} />
          <div className="min-w-0 flex-1">
            <h3 id="confirm-title" className="text-base font-semibold text-slate-900">{title}</h3>
            {message && <p className="mt-1.5 text-sm text-slate-500 whitespace-pre-line break-words">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className="btn-secondary text-sm">
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className={danger ? 'btn-danger text-sm' : 'btn-primary text-sm'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Dùng ngoài ConfirmProvider thì lùi về hộp thoại gốc của trình duyệt (không làm hỏng chức năng)
const fallbackConfirm = (options) => Promise.resolve(window.confirm(typeof options === 'string' ? options : options?.message || ''));

export function useConfirm() {
  return useContext(ConfirmContext) || fallbackConfirm;
}
