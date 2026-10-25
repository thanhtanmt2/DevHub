import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/common/Icon';
import { CHIP } from '@/utils/colors';

// Thẻ kỹ năng (một tông xanh thương hiệu)
export function SkillTag({ name, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${CHIP} ${className}`}>
      {name}
    </span>
  );
}

// Popup liệt kê dự án minh chứng của một kỹ năng
export function SkillEvidenceModal({ skill, evidence, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const stop = (e) => e.stopPropagation();
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={(e) => { stop(e); onClose(); }}>
      <div role="dialog" aria-modal="true" className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5" onClick={stop}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-bold text-slate-900">Dự án minh chứng cho kỹ năng <span className="text-emerald-700">{skill}</span></h3>
          <button onClick={onClose} aria-label="Đóng" className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>
        <p className="text-xs text-slate-500 mb-4">Các dự án thật trên DevHub mà ứng viên đã hoàn thành, có yêu cầu kỹ năng này.</p>
        <ul className="space-y-3">
          {evidence.map((e) => (
            <li key={e.project_id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-sm text-slate-900">{e.project_name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                {e.position && <span>Vị trí: <b>{e.position}</b></span>}
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                  {e.project_status === 'COMPLETED' ? 'Dự án đã hoàn thành' : 'Đã hoàn thành phần việc'}
                </span>
                {e.score !== null && e.score !== undefined && <span>Đánh giá: <b className="text-slate-900">{e.score}/10</b></span>}
              </div>
              {e.comment && <p className="mt-2 text-xs italic text-slate-500">“{e.comment}”</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
}

// Kỹ năng có minh chứng dự án trên nền tảng: viền/nền nổi bật + biểu tượng; bấm để xem danh sách dự án.
// evidence = [{ project_id, project_name, position, project_status, score, comment }]
export function VerifiedSkillTag({ name, evidence = [], className = '', children }) {
  const [open, setOpen] = useState(false);
  const count = new Set(evidence.map((e) => e.project_id)).size;
  if (count === 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${CHIP} ${className}`}>
        {name}{children}
      </span>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        title="Bấm để xem các dự án minh chứng"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 ring-2 ring-inset ring-emerald-400 shadow-sm hover:bg-emerald-100 cursor-pointer ${className}`}
      >
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" /></svg>
        {name}{children}
        <span className="text-[10px] font-bold text-emerald-700/80">{count} dự án</span>
      </button>
      {open && <SkillEvidenceModal skill={name} evidence={evidence} onClose={() => setOpen(false)} />}
    </>
  );
}

const WORK_TYPES = {
  FULL_TIME: { label: 'Full-time', icon: 'briefcase' },
  PART_TIME: { label: 'Part-time', icon: 'clock' },
  REMOTE: { label: 'Remote', icon: 'globe' },
  FREELANCE: { label: 'Freelance', icon: 'sparkles' },
};

// Hình thức làm việc: cùng một tông, phân biệt bằng icon
export function WorkTypeBadge({ type, className = '' }) {
  const t = WORK_TYPES[type];
  if (!t) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-slate-50 text-slate-700 ring-slate-200 ${className}`}>
      <Icon name={t.icon} className="w-3.5 h-3.5 text-primary-600" />{t.label}
    </span>
  );
}

// Mức lương / thù lao nổi bật (chữ đậm, nền xanh nhạt)
export function SalaryPill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-sm font-bold ring-1 ring-inset ring-primary-200 ${className}`}>
      <Icon name="cash" className="w-4 h-4" />{children}
    </span>
  );
}
