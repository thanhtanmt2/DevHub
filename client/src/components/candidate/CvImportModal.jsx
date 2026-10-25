import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { candidateApi } from '@/api/candidateApi';
import { EXP_TYPES } from '@/components/candidate/ExperienceTimeline';

const IMPORT_TYPES = ['COMPANY', 'PROJECT', 'FREELANCE', 'PERSONAL'];
const isPdf = (cv) => /\.pdf$/i.test((cv.file_url || '').split('?')[0]);
const fmt = (d) => (d ? `${d.slice(5, 7)}/${d.slice(0, 4)}` : '?');
const errMsg = (err, fallback) => err.response?.data?.message || fallback;

// Modal nhập kỹ năng / kinh nghiệm từ một CV đã tải lên.
// mode = 'skills' | 'experience'. Bước 1: chọn CV. Bước 2: AI đọc, hiện bản xem trước để chọn. Bước 3: lưu.
export default function CvImportModal({ mode, onClose, onDone }) {
  const isSkills = mode === 'skills';
  const [cvId, setCvId] = useState('');
  const [preview, setPreview] = useState(null);
  const [skillSel, setSkillSel] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { data: cvRes, isLoading: cvLoading } = useQuery({ queryKey: ['candidate-cvs'], queryFn: () => candidateApi.getMyCvs() });
  const cvs = cvRes?.data?.data || [];
  useEffect(() => {
    if (!cvId && cvs.length) setCvId((cvs.find((c) => c.is_default && isPdf(c)) || cvs.find(isPdf))?.id || '');
  }, [cvs, cvId]);

  const parseMutation = useMutation({
    mutationFn: () => candidateApi.parseCv(cvId, mode),
    onSuccess: (res) => {
      const d = res.data.data;
      setPreview(d);
      if (isSkills) {
        setSkillSel(Object.fromEntries(d.skills.filter((s) => !s.already).map((s) => [s.skill_id, true])));
      } else {
        setItems(d.experiences.map((it) => ({ ...it, checked: true, action: it.duplicate ? 'skip' : 'create', tasksText: it.tasks.join('\n'), techText: it.technologies.join(', ') })));
      }
    },
    onError: (err) => toast.error(errMsg(err, 'Không đọc được CV')),
  });

  const importMutation = useMutation({
    mutationFn: (payload) => candidateApi.importFromCv(payload),
    onSuccess: (res) => {
      const r = res.data.data;
      if (r.errors.length) toast.error(`Không nhập được ${r.errors.length} mục: ${r.errors.map((e) => `${e.name} (${e.message})`).join('; ')}`, { duration: 8000 });
      const parts = [];
      if (r.skills_added) parts.push(`${r.skills_added} kỹ năng`);
      if (r.experiences_created) parts.push(`${r.experiences_created} mục kinh nghiệm mới`);
      if (r.experiences_updated) parts.push(`${r.experiences_updated} mục được cập nhật`);
      if (parts.length) toast.success(`Đã nhập ${parts.join(', ')}`);
      onDone?.();
      if (!r.errors.length) onClose();
    },
    onError: (err) => toast.error(errMsg(err, 'Nhập thất bại')),
  });

  const setItem = (key, patch) => setItems((arr) => arr.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const selectedSkillIds = Object.keys(skillSel).filter((k) => skillSel[k]);
  const activeItems = items.filter((it) => it.checked && it.action !== 'skip');
  const invalidItem = activeItems.find((it) => !it.company_name.trim() || !it.job_title.trim() || !it.start_date || (it.end_date && it.end_date < it.start_date));

  const save = () => {
    if (isSkills) return importMutation.mutate({ skill_ids: selectedSkillIds });
    importMutation.mutate({
      experiences: activeItems.map((it) => ({
        key: it.key, type: it.type, parent_ref: it.parent_ref, company_name: it.company_name, job_title: it.job_title,
        start_date: it.start_date, end_date: it.end_date || null, description: it.description,
        tasks: it.tasksText.split('\n').map((x) => x.trim()).filter(Boolean),
        technologies: [...new Set(it.techText.split(',').map((x) => x.trim()).filter(Boolean))],
        link_url: it.link_url || null, action: it.action, overwrite_id: it.action === 'overwrite' ? it.duplicate?.id : undefined,
      })),
    });
  };

  const title = isSkills ? 'Nhập kỹ năng từ CV' : 'Nhập kinh nghiệm từ CV';
  const canSave = isSkills ? selectedSkillIds.length > 0 : activeItems.length > 0 && !invalidItem;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 p-5 border-b">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">AI đọc CV bạn đã tải lên và đề xuất. Chưa có gì được lưu cho đến khi bạn bấm Lưu.</p>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {/* Bước 1: chọn CV */}
          {!preview && (
            <div>
              {cvLoading ? <p className="text-sm text-slate-500">Đang tải danh sách CV...</p> : cvs.length === 0 ? (
                <p className="text-sm text-slate-600">Bạn chưa tải CV nào. Hãy vào tab <b>Quản lý CV</b> để tải lên một CV (PDF).</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-700 mb-2">Chọn CV để đọc</p>
                  <ul className="space-y-2">
                    {cvs.map((cv) => {
                      const ok = isPdf(cv);
                      return (
                        <li key={cv.id}>
                          <label className={`flex items-center gap-3 p-3 rounded-lg border ${cvId === cv.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200'} ${ok ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                            <input type="radio" name="cv" disabled={!ok} checked={cvId === cv.id} onChange={() => setCvId(cv.id)} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-900 truncate">{cv.name || cv.file_name}</span>
                              <span className="block text-xs text-slate-500 truncate">{cv.file_name}{cv.is_default ? ' · CV mặc định' : ''}</span>
                            </span>
                            {!ok && <span className="text-xs text-amber-700">Cần bản PDF</span>}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {!cvs.some(isPdf) && <p className="text-xs text-amber-700 mt-3">Hiện chỉ đọc được CV dạng PDF. Hãy tải lên bản PDF của CV.</p>}
                </>
              )}
            </div>
          )}

          {/* Bước 2: xem trước kỹ năng */}
          {preview && isSkills && (
            preview.skills.length === 0 ? (
              <p className="text-sm text-slate-600">Không tìm thấy kỹ năng nào trong CV khớp với danh sách kỹ năng của hệ thống.</p>
            ) : (
              <div>
                <p className="text-sm text-slate-600 mb-3">Tìm thấy {preview.skills.length} kỹ năng khớp danh sách của hệ thống. Bỏ chọn kỹ năng bạn không muốn thêm.</p>
                <div className="flex flex-wrap gap-2">
                  {preview.skills.map((s) => (
                    <label key={s.skill_id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${s.already ? 'bg-slate-50 text-slate-400 border-slate-200' : skillSel[s.skill_id] ? 'bg-primary-50 border-primary-300 text-primary-800' : 'border-slate-200 text-slate-600'}`}>
                      <input type="checkbox" disabled={s.already} checked={!!skillSel[s.skill_id]} onChange={(e) => setSkillSel({ ...skillSel, [s.skill_id]: e.target.checked })} />
                      {s.name}{s.already && <span className="text-xs">(đã có)</span>}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Kỹ năng không có trong danh sách của hệ thống sẽ không được thêm.</p>
              </div>
            )
          )}

          {/* Bước 2: xem trước kinh nghiệm */}
          {preview && !isSkills && (
            items.length === 0 ? (
              <p className="text-sm text-slate-600">Không tìm thấy kinh nghiệm hay dự án nào trong CV này.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Tìm thấy {items.length} mục. Kiểm tra, sửa và bỏ chọn những mục bạn không muốn nhập.</p>
                {items.map((it) => (
                  <div key={it.key} className={`rounded-lg border p-3 ${it.checked ? 'border-slate-300' : 'border-slate-200 opacity-60'}`}>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <input type="checkbox" aria-label="Nhập mục này" checked={it.checked} onChange={(e) => setItem(it.key, { checked: e.target.checked })} />
                      <select className="input-field !w-auto !py-1 text-xs" value={it.type} onChange={(e) => setItem(it.key, { type: e.target.value })}>
                        {IMPORT_TYPES.map((t) => <option key={t} value={t}>{EXP_TYPES[t].label}</option>)}
                      </select>
                      {it.type === 'PROJECT' && (
                        <select className="input-field !w-auto !py-1 text-xs" value={it.parent_ref || ''} onChange={(e) => setItem(it.key, { parent_ref: e.target.value })}>
                          <option value="">Thuộc công ty...</option>
                          {items.filter((x) => x.type === 'COMPANY').map((c) => <option key={c.key} value={`k:${c.key}`}>{c.company_name}</option>)}
                          {preview.existing_companies.map((c) => <option key={c.id} value={`e:${c.id}`}>{c.company_name} (đã có)</option>)}
                        </select>
                      )}
                      {it.duplicate && (
                        <select className="input-field !w-auto !py-1 text-xs bg-amber-50" value={it.action} onChange={(e) => setItem(it.key, { action: e.target.value })} title={`Trùng với: ${it.duplicate.company_name} – ${it.duplicate.job_title}`}>
                          <option value="skip">Đã có, bỏ qua</option>
                          <option value="overwrite">Ghi đè mục đã có</option>
                          <option value="create">Vẫn thêm mới</option>
                        </select>
                      )}
                    </div>
                    {it.duplicate && <p className="text-xs text-amber-700 mb-2">Trùng với mục đã có: {it.duplicate.company_name} – {it.duplicate.job_title} ({fmt(it.duplicate.start_date)} – {it.duplicate.end_date ? fmt(it.duplicate.end_date) : 'nay'})</p>}
                    {it.checked && it.action !== 'skip' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input className="input-field" aria-label="Tên" maxLength={200} value={it.company_name} onChange={(e) => setItem(it.key, { company_name: e.target.value })} placeholder={EXP_TYPES[it.type].nameLabel} />
                        <input className="input-field" aria-label="Vai trò" maxLength={150} value={it.job_title} onChange={(e) => setItem(it.key, { job_title: e.target.value })} placeholder={EXP_TYPES[it.type].roleLabel} />
                        <div>
                          <label className="text-[11px] text-slate-500">Bắt đầu *</label>
                          <input type="date" className="input-field" value={it.start_date || ''} onChange={(e) => setItem(it.key, { start_date: e.target.value || null })} />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500">Kết thúc (trống = hiện tại)</label>
                          <input type="date" className="input-field" value={it.end_date || ''} onChange={(e) => setItem(it.key, { end_date: e.target.value || null })} />
                        </div>
                        <textarea className="input-field resize-none md:col-span-2" rows={2} aria-label="Mô tả" placeholder="Mô tả ngắn" value={it.description} onChange={(e) => setItem(it.key, { description: e.target.value })} />
                        <textarea className="input-field resize-none md:col-span-2" rows={3} aria-label="Việc đã làm" placeholder="Việc cụ thể đã làm (mỗi dòng một việc)" value={it.tasksText} onChange={(e) => setItem(it.key, { tasksText: e.target.value })} />
                        <input className="input-field md:col-span-2" aria-label="Công nghệ" placeholder="Công nghệ (cách nhau bằng dấu phẩy)" value={it.techText} onChange={(e) => setItem(it.key, { techText: e.target.value })} />
                        {!it.start_date && <p className="text-xs text-red-600 md:col-span-2">CV không ghi rõ ngày bắt đầu, hãy chọn ngày hoặc bỏ chọn mục này.</p>}
                        {it.end_date && it.start_date && it.end_date < it.start_date && <p className="text-xs text-red-600 md:col-span-2">Ngày kết thúc phải sau ngày bắt đầu.</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t">
          {preview && <button onClick={() => { setPreview(null); setItems([]); }} className="btn-secondary text-sm mr-auto">← Chọn CV khác</button>}
          <button onClick={onClose} className="btn-secondary text-sm">Hủy</button>
          {!preview ? (
            <button onClick={() => parseMutation.mutate()} disabled={!cvId || parseMutation.isPending} className="btn-primary text-sm">
              {parseMutation.isPending ? 'AI đang đọc CV (có thể mất ~30 giây)...' : 'Đọc CV'}
            </button>
          ) : (
            <button onClick={save} disabled={!canSave || importMutation.isPending} className="btn-primary text-sm">
              {importMutation.isPending ? 'Đang lưu...' : isSkills ? `Lưu ${selectedSkillIds.length} kỹ năng` : `Lưu ${activeItems.length} mục`}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
