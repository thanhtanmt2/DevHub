import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { candidateApi } from '@/api/candidateApi';
import { EXP_TYPES } from '@/components/candidate/ExperienceTimeline';

const IMPORT_TYPES = ['COMPANY', 'PROJECT', 'FREELANCE', 'PERSONAL'];
const MODE_LABELS = {
  info: 'Thông tin cá nhân',
  skills: 'Kỹ năng',
  experience: 'Kinh nghiệm & Dự án',
};

const isPdf = (cv) => /\.pdf$/i.test((cv?.file_url || '').split('?')[0]);
const fmt = (d) => (d ? `${d.slice(5, 7)}/${d.slice(0, 4)}` : '?');
const errMsg = (err, fallback) => err.response?.data?.message || fallback;

// Modal lọc và nhập Thông tin cá nhân / Kỹ năng / Kinh nghiệm từ CV.
// Có thể dùng cho 1 mục (mode = 'info' | 'skills' | 'experience') hoặc nhiều mục cùng lúc (modes = ['info', 'skills', 'experience']).
export default function CvImportModal({
  mode,
  modes: initialModes,
  initialCvId = '',
  autoParse = false,
  onClose,
  onDone,
}) {
  const resolvedModes = initialModes?.length ? initialModes : mode ? [mode] : ['info', 'skills', 'experience'];
  const isMultiMode = !mode || (initialModes && initialModes.length > 1);

  const [selectedModes, setSelectedModes] = useState(resolvedModes);
  const [cvId, setCvId] = useState(initialCvId);
  const [preview, setPreview] = useState(null);

  // State cho Thông tin cá nhân: { [field]: { choice: 'cv' | 'current', value: string } }
  const [infoSel, setInfoSel] = useState({});
  // State cho Kỹ năng: { [skill_id]: boolean }
  const [skillSel, setSkillSel] = useState({});
  // State cho Kinh nghiệm
  const [items, setItems] = useState([]);

  const autoParsedRef = useRef(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { data: cvRes, isLoading: cvLoading } = useQuery({
    queryKey: ['candidate-cvs'],
    queryFn: () => candidateApi.getMyCvs(),
  });
  const cvs = cvRes?.data?.data || [];

  useEffect(() => {
    if (!cvId && cvs.length) {
      setCvId((cvs.find((c) => c.is_default && isPdf(c)) || cvs.find(isPdf))?.id || '');
    }
  }, [cvs, cvId]);

  const parseMutation = useMutation({
    mutationFn: (targetCvId) => candidateApi.parseCv(targetCvId || cvId, selectedModes),
    onSuccess: (res) => {
      const d = res.data.data;
      setPreview(d);

      // Khởi tạo lựa chọn cho Thông tin cá nhân
      if (d.personal_info) {
        const nextInfo = {};
        for (const f of d.personal_info) {
          if (f.status === 'new') {
            // Chưa có trong hồ sơ -> tự động chọn điền thêm từ CV
            nextInfo[f.field] = { choice: 'cv', value: f.cv_value };
          } else if (f.status === 'conflict') {
            // Cùng mục nhưng khác nhau -> mặc định hiển thị song song để người dùng chọn (gợi ý sẵn giá trị CV)
            nextInfo[f.field] = { choice: 'cv', value: f.cv_value };
          } else {
            nextInfo[f.field] = { choice: 'current', value: f.current_value };
          }
        }
        setInfoSel(nextInfo);
      } else {
        setInfoSel({});
      }

      // Khởi tạo lựa chọn cho Kỹ năng
      if (d.skills) {
        setSkillSel(Object.fromEntries(d.skills.filter((s) => !s.already).map((s) => [s.skill_id, true])));
      } else {
        setSkillSel({});
      }

      // Khởi tạo lựa chọn cho Kinh nghiệm
      if (d.experiences) {
        setItems(
          d.experiences.map((it) => ({
            ...it,
            checked: true,
            action: it.duplicate ? 'skip' : 'create',
            tasksText: (it.tasks || []).join('\n'),
            techText: (it.technologies || []).join(', '),
          }))
        );
      } else {
        setItems([]);
      }
    },
    onError: (err) => toast.error(errMsg(err, 'Không đọc được CV')),
  });

  // Tự động đọc CV ngay khi vừa tải CV lên (nếu autoParse = true)
  useEffect(() => {
    if (autoParse && initialCvId && !autoParsedRef.current && selectedModes.length > 0) {
      autoParsedRef.current = true;
      parseMutation.mutate(initialCvId);
    }
  }, [autoParse, initialCvId]); // eslint-disable-line react-hooks/exhaustive-deps

  const importMutation = useMutation({
    mutationFn: (payload) => candidateApi.importFromCv(payload),
    onSuccess: (res) => {
      const r = res.data.data;
      if (r.errors?.length) {
        toast.error(
          `Một số mục chưa lưu được: ${r.errors.map((e) => `${e.name} (${e.message})`).join('; ')}`,
          { duration: 8000 }
        );
      }
      const parts = [];
      if (r.info_updated) parts.push(`${r.info_updated} thông tin cá nhân`);
      if (r.skills_added) parts.push(`${r.skills_added} kỹ năng`);
      if (r.experiences_created) parts.push(`${r.experiences_created} mục kinh nghiệm mới`);
      if (r.experiences_updated) parts.push(`${r.experiences_updated} mục kinh nghiệm cập nhật`);
      if (parts.length) {
        toast.success(`Đã lưu ${parts.join(', ')} từ CV!`);
      } else if (!r.errors?.length) {
        toast.success('Đã hoàn tất kiểm tra thông tin từ CV');
      }
      onDone?.(r);
      if (!r.errors?.length) onClose();
    },
    onError: (err) => toast.error(errMsg(err, 'Nhập thất bại')),
  });

  const setItem = (key, patch) => setItems((arr) => arr.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  const setInfoField = (field, patch) =>
    setInfoSel((prev) => ({ ...prev, [field]: { ...(prev[field] || {}), ...patch } }));

  const toggleMode = (m) => {
    setSelectedModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  // Tính toán các mục sẽ lưu
  const infoFields = preview?.personal_info || [];
  const newInfoFields = infoFields.filter((f) => f.status === 'new');
  const conflictInfoFields = infoFields.filter((f) => f.status === 'conflict');
  const sameInfoFields = infoFields.filter((f) => f.status === 'same');

  const selectedPersonalInfo = {};
  for (const f of infoFields) {
    const sel = infoSel[f.field];
    if (sel?.choice === 'cv' && String(sel.value || '').trim()) {
      selectedPersonalInfo[f.field] = String(sel.value).trim();
    }
  }
  const infoUpdateCount = Object.keys(selectedPersonalInfo).length;

  const selectedSkillIds = Object.keys(skillSel).filter((k) => skillSel[k]);
  const activeItems = items.filter((it) => it.checked && it.action !== 'skip');
  const invalidItem = activeItems.find(
    (it) =>
      !it.company_name.trim() ||
      !it.job_title.trim() ||
      !it.start_date ||
      (it.end_date && it.end_date < it.start_date)
  );

  const hasConflictInfo = conflictInfoFields.length > 0;
  const totalChanges = infoUpdateCount + selectedSkillIds.length + activeItems.length;
  // Cho phép bấm Hoàn tất nếu có ít nhất 1 thay đổi HOẶC người dùng đã chọn "Giữ hiện tại" cho các mục xung đột
  const canSave = (totalChanges > 0 || hasConflictInfo) && !invalidItem;

  const save = () => {
    if (totalChanges === 0) {
      toast.success('Đã giữ nguyên thông tin hiện tại trong hồ sơ');
      onClose();
      return;
    }
    const payload = {};
    if (infoUpdateCount > 0) payload.personal_info = selectedPersonalInfo;
    if (selectedSkillIds.length > 0) payload.skill_ids = selectedSkillIds;
    if (activeItems.length > 0) {
      payload.experiences = activeItems.map((it) => ({
        key: it.key,
        type: it.type,
        parent_ref: it.parent_ref,
        company_name: it.company_name,
        job_title: it.job_title,
        start_date: it.start_date,
        end_date: it.end_date || null,
        description: it.description,
        tasks: it.tasksText.split('\n').map((x) => x.trim()).filter(Boolean),
        technologies: [...new Set(it.techText.split(',').map((x) => x.trim()).filter(Boolean))],
        link_url: it.link_url || null,
        action: it.action,
        overwrite_id: it.action === 'overwrite' ? it.duplicate?.id : undefined,
      }));
    }
    importMutation.mutate(payload);
  };

  const title =
    selectedModes.length === 1
      ? `Lọc ${MODE_LABELS[selectedModes[0]].toLowerCase()} từ CV`
      : 'Lọc thông tin từ CV vào hồ sơ';

  const saveButtonLabel = () => {
    if (importMutation.isPending) return 'Đang lưu...';
    const parts = [];
    if (infoUpdateCount > 0) parts.push(`${infoUpdateCount} thông tin`);
    if (selectedSkillIds.length > 0) parts.push(`${selectedSkillIds.length} kỹ năng`);
    if (activeItems.length > 0) parts.push(`${activeItems.length} kinh nghiệm`);
    if (parts.length === 0) return 'Hoàn tất (Giữ nguyên hiện tại)';
    return `Lưu (${parts.join(', ')})`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              AI tự động điền các mục hồ sơ còn trống và hiển thị các mục khác nhau để bạn lựa chọn trước khi lưu.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Trạng thái đang tự động đọc CV vừa tải lên */}
          {!preview && parseMutation.isPending && (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                AI đang phân tích CV và đối chiếu với hồ sơ của bạn...
              </p>
              <p className="text-xs text-slate-500">Quá trình này có thể mất khoảng 10 – 30 giây.</p>
            </div>
          )}

          {/* Bước 1: Chọn CV (và chọn các phần muốn lọc nếu mở ở chế độ nhiều phần) */}
          {!preview && !parseMutation.isPending && (
            <div className="space-y-4">
              {isMultiMode && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Chọn các mục muốn lọc từ CV</p>
                  <div className="flex flex-wrap gap-2">
                    {(['info', 'skills', 'experience']).map((m) => {
                      const active = selectedModes.includes(m);
                      return (
                        <label
                          key={m}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium cursor-pointer transition ${
                            active
                              ? 'border-primary-500 bg-primary-50 text-primary-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleMode(m)}
                            className="rounded text-primary-700"
                          />
                          {MODE_LABELS[m]}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {cvLoading ? (
                <p className="text-sm text-slate-500">Đang tải danh sách CV...</p>
              ) : cvs.length === 0 ? (
                <p className="text-sm text-slate-600">
                  Bạn chưa tải CV nào. Hãy vào tab <b>Quản lý CV</b> để tải lên một CV (PDF).
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-700 mb-2">Chọn CV để đọc</p>
                  <ul className="space-y-2">
                    {cvs.map((cv) => {
                      const ok = isPdf(cv);
                      return (
                        <li key={cv.id}>
                          <label
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              cvId === cv.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
                            } ${ok ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                          >
                            <input
                              type="radio"
                              name="cv"
                              disabled={!ok}
                              checked={cvId === cv.id}
                              onChange={() => setCvId(cv.id)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-900 truncate">
                                {cv.name || cv.file_name}
                              </span>
                              <span className="block text-xs text-slate-500 truncate">
                                {cv.file_name}
                                {cv.is_default ? ' · CV mặc định' : ''}
                              </span>
                            </span>
                            {!ok && <span className="text-xs text-amber-700">Cần bản PDF</span>}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {!cvs.some(isPdf) && (
                    <p className="text-xs text-amber-700 mt-3">
                      Hiện chỉ đọc được CV dạng PDF. Hãy tải lên bản PDF của CV.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bước 2A: Xem trước THÔNG TIN CÁ NHÂN */}
          {preview && preview.modes?.includes('info') && (
            <div className="space-y-4">
              {preview.modes.length > 1 && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-base">1. Thông tin cá nhân</h4>
                  <span className="text-xs text-slate-500">
                    {newInfoFields.length} mục mới · {conflictInfoFields.length} mục khác nhau
                  </span>
                </div>
              )}

              {infoFields.length === 0 ? (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Không tìm thấy thông tin cá nhân nào (Chức danh, SĐT, Địa chỉ, GitHub, Portfolio, Giới thiệu) trong CV này.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Nhóm 1: Các thông tin chưa có trong hồ sơ -> tự động điền thêm */}
                  {newInfoFields.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                          Thông tin chưa có trong hồ sơ — Tự động điền thêm ({newInfoFields.length})
                        </p>
                      </div>
                      {newInfoFields.map((f) => {
                        const sel = infoSel[f.field] || { choice: 'cv', value: f.cv_value };
                        const checked = sel.choice === 'cv';
                        const isLong = f.field === 'introduction';
                        return (
                          <div
                            key={f.field}
                            className={`rounded-lg border p-3 transition ${
                              checked ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50 opacity-70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) =>
                                    setInfoField(f.field, { choice: e.target.checked ? 'cv' : 'current' })
                                  }
                                  className="rounded text-emerald-600"
                                />
                                {f.label}
                              </label>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Hồ sơ đang trống → Điền thêm
                              </span>
                            </div>
                            {checked &&
                              (isLong ? (
                                <textarea
                                  rows={3}
                                  className="input-field text-sm resize-none bg-white"
                                  value={sel.value}
                                  onChange={(e) => setInfoField(f.field, { value: e.target.value })}
                                />
                              ) : (
                                <input
                                  type="text"
                                  className="input-field text-sm bg-white"
                                  value={sel.value}
                                  onChange={(e) => setInfoField(f.field, { value: e.target.value })}
                                />
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Nhóm 2: Các thông tin cùng mục nhưng khác nhau -> hiện lên cho người dùng chọn */}
                  {conflictInfoFields.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                        <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                          Thông tin khác với hồ sơ hiện tại — Hãy chọn bản bạn muốn dùng ({conflictInfoFields.length})
                        </p>
                      </div>
                      {conflictInfoFields.map((f) => {
                        const sel = infoSel[f.field] || { choice: 'cv', value: f.cv_value };
                        const useCv = sel.choice === 'cv';
                        const isLong = f.field === 'introduction';
                        return (
                          <div key={f.field} className="rounded-xl border border-amber-300 bg-amber-50/30 p-3.5 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900">{f.label}</span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                Khác nhau · Chọn 1 trong 2
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {/* Lựa chọn 1: Giữ hiện tại */}
                              <label
                                className={`flex flex-col justify-between p-3 rounded-lg border cursor-pointer transition ${
                                  !useCv
                                    ? 'border-slate-800 bg-white ring-2 ring-slate-800/15'
                                    : 'border-slate-200 bg-white/70 hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <input
                                      type="radio"
                                      name={`conflict-${f.field}`}
                                      checked={!useCv}
                                      onChange={() => setInfoField(f.field, { choice: 'current' })}
                                    />
                                    <span className="text-xs font-semibold text-slate-600">
                                      Giữ thông tin đang có trong hồ sơ
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-800 break-words whitespace-pre-line pl-5">
                                    {f.current_value}
                                  </p>
                                </div>
                              </label>

                              {/* Lựa chọn 2: Dùng từ CV */}
                              <label
                                className={`flex flex-col justify-between p-3 rounded-lg border cursor-pointer transition ${
                                  useCv
                                    ? 'border-primary-600 bg-primary-50/40 ring-2 ring-primary-500/20'
                                    : 'border-slate-200 bg-white/70 hover:border-slate-300'
                                }`}
                              >
                                <div className="w-full">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <input
                                      type="radio"
                                      name={`conflict-${f.field}`}
                                      checked={useCv}
                                      onChange={() => setInfoField(f.field, { choice: 'cv' })}
                                    />
                                    <span className="text-xs font-semibold text-primary-700">
                                      Cập nhật theo thông tin trong CV
                                    </span>
                                  </div>
                                  {useCv ? (
                                    isLong ? (
                                      <textarea
                                        rows={3}
                                        className="input-field text-sm bg-white resize-none"
                                        value={sel.value}
                                        onChange={(e) => setInfoField(f.field, { value: e.target.value })}
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        className="input-field text-sm bg-white"
                                        value={sel.value}
                                        onChange={(e) => setInfoField(f.field, { value: e.target.value })}
                                      />
                                    )
                                  ) : (
                                    <p className="text-sm text-slate-800 break-words whitespace-pre-line pl-5">
                                      {sel.value}
                                    </p>
                                  )}
                                </div>
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Nhóm 3: Các thông tin đã giống hệt trong hồ sơ */}
                  {sameInfoFields.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1.5">
                        Đã giống với hồ sơ hiện tại ({sameInfoFields.length} mục — không cần cập nhật):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sameInfoFields.map((f) => (
                          <span
                            key={f.field}
                            className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md"
                          >
                            <b>{f.label}:</b>{' '}
                            <span className="truncate max-w-[220px]">{f.current_value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bước 2B: Xem trước KỸ NĂNG */}
          {preview && preview.modes?.includes('skills') && (
            <div className="space-y-3">
              {preview.modes.length > 1 && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-base">
                    {preview.modes.includes('info') ? '2. Kỹ năng' : '1. Kỹ năng'}
                  </h4>
                  <span className="text-xs text-slate-500">Chọn {selectedSkillIds.length} kỹ năng mới</span>
                </div>
              )}

              {(preview.skills || []).length === 0 ? (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Không tìm thấy kỹ năng nào trong CV khớp với danh sách kỹ năng của hệ thống.
                </p>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-3">
                    Tìm thấy {preview.skills.length} kỹ năng khớp danh sách của hệ thống. Bỏ chọn kỹ năng bạn không muốn thêm.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preview.skills.map((s) => (
                      <label
                        key={s.skill_id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer ${
                          s.already
                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-default'
                            : skillSel[s.skill_id]
                              ? 'bg-primary-50 border-primary-300 text-primary-800'
                              : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={s.already}
                          checked={!!skillSel[s.skill_id]}
                          onChange={(e) => setSkillSel({ ...skillSel, [s.skill_id]: e.target.checked })}
                        />
                        {s.name}
                        {s.already && <span className="text-xs">(đã có)</span>}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Kỹ năng không có trong danh sách của hệ thống sẽ không được thêm.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bước 2C: Xem trước KINH NGHIỆM */}
          {preview && preview.modes?.includes('experience') && (
            <div className="space-y-3">
              {preview.modes.length > 1 && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-base">
                    {preview.modes.length === 3
                      ? '3. Kinh nghiệm & Dự án'
                      : preview.modes.length === 2
                        ? '2. Kinh nghiệm & Dự án'
                        : 'Kinh nghiệm & Dự án'}
                  </h4>
                  <span className="text-xs text-slate-500">Chọn {activeItems.length} mục</span>
                </div>
              )}

              {items.length === 0 ? (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Không tìm thấy kinh nghiệm hay dự án nào trong CV này.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Tìm thấy {items.length} mục. Kiểm tra, sửa và bỏ chọn những mục bạn không muốn nhập.
                  </p>
                  {items.map((it) => (
                    <div
                      key={it.key}
                      className={`rounded-lg border p-3 ${it.checked ? 'border-slate-300' : 'border-slate-200 opacity-60'}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          aria-label="Nhập mục này"
                          checked={it.checked}
                          onChange={(e) => setItem(it.key, { checked: e.target.checked })}
                        />
                        <select
                          className="input-field !w-auto !py-1 text-xs"
                          value={it.type}
                          onChange={(e) => setItem(it.key, { type: e.target.value })}
                        >
                          {IMPORT_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {EXP_TYPES[t].label}
                            </option>
                          ))}
                        </select>
                        {it.type === 'PROJECT' && (
                          <select
                            className="input-field !w-auto !py-1 text-xs"
                            value={it.parent_ref || ''}
                            onChange={(e) => setItem(it.key, { parent_ref: e.target.value })}
                          >
                            <option value="">Thuộc công ty...</option>
                            {items
                              .filter((x) => x.type === 'COMPANY')
                              .map((c) => (
                                <option key={c.key} value={`k:${c.key}`}>
                                  {c.company_name}
                                </option>
                              ))}
                            {(preview.existing_companies || []).map((c) => (
                              <option key={c.id} value={`e:${c.id}`}>
                                {c.company_name} (đã có)
                              </option>
                            ))}
                          </select>
                        )}
                        {it.duplicate && (
                          <select
                            className="input-field !w-auto !py-1 text-xs bg-amber-50"
                            value={it.action}
                            onChange={(e) => setItem(it.key, { action: e.target.value })}
                            title={`Trùng với: ${it.duplicate.company_name} – ${it.duplicate.job_title}`}
                          >
                            <option value="skip">Đã có, bỏ qua</option>
                            <option value="overwrite">Ghi đè mục đã có</option>
                            <option value="create">Vẫn thêm mới</option>
                          </select>
                        )}
                      </div>
                      {it.duplicate && (
                        <p className="text-xs text-amber-700 mb-2">
                          Trùng với mục đã có: {it.duplicate.company_name} – {it.duplicate.job_title} (
                          {fmt(it.duplicate.start_date)} – {it.duplicate.end_date ? fmt(it.duplicate.end_date) : 'nay'})
                        </p>
                      )}
                      {it.checked && it.action !== 'skip' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            className="input-field"
                            aria-label="Tên"
                            maxLength={200}
                            value={it.company_name}
                            onChange={(e) => setItem(it.key, { company_name: e.target.value })}
                            placeholder={EXP_TYPES[it.type].nameLabel}
                          />
                          <input
                            className="input-field"
                            aria-label="Vai trò"
                            maxLength={150}
                            value={it.job_title}
                            onChange={(e) => setItem(it.key, { job_title: e.target.value })}
                            placeholder={EXP_TYPES[it.type].roleLabel}
                          />
                          <div>
                            <label className="text-[11px] text-slate-500">Bắt đầu *</label>
                            <input
                              type="date"
                              className="input-field"
                              value={it.start_date || ''}
                              onChange={(e) => setItem(it.key, { start_date: e.target.value || null })}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-500">Kết thúc (trống = hiện tại)</label>
                            <input
                              type="date"
                              className="input-field"
                              value={it.end_date || ''}
                              onChange={(e) => setItem(it.key, { end_date: e.target.value || null })}
                            />
                          </div>
                          <textarea
                            className="input-field resize-none md:col-span-2"
                            rows={2}
                            aria-label="Mô tả"
                            placeholder="Mô tả ngắn"
                            value={it.description}
                            onChange={(e) => setItem(it.key, { description: e.target.value })}
                          />
                          <textarea
                            className="input-field resize-none md:col-span-2"
                            rows={3}
                            aria-label="Việc đã làm"
                            placeholder="Việc cụ thể đã làm (mỗi dòng một việc)"
                            value={it.tasksText}
                            onChange={(e) => setItem(it.key, { tasksText: e.target.value })}
                          />
                          <input
                            className="input-field md:col-span-2"
                            aria-label="Công nghệ"
                            placeholder="Công nghệ (cách nhau bằng dấu phẩy)"
                            value={it.techText}
                            onChange={(e) => setItem(it.key, { techText: e.target.value })}
                          />
                          {!it.start_date && (
                            <p className="text-xs text-red-600 md:col-span-2">
                              CV không ghi rõ ngày bắt đầu, hãy chọn ngày hoặc bỏ chọn mục này.
                            </p>
                          )}
                          {it.end_date && it.start_date && it.end_date < it.start_date && (
                            <p className="text-xs text-red-600 md:col-span-2">
                              Ngày kết thúc phải sau ngày bắt đầu.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t">
          {preview && (
            <button
              onClick={() => {
                setPreview(null);
                setItems([]);
              }}
              className="btn-secondary text-sm mr-auto"
            >
              ← Chọn CV khác
            </button>
          )}
          <button onClick={onClose} className="btn-secondary text-sm">
            Hủy
          </button>
          {!preview ? (
            <button
              onClick={() => parseMutation.mutate(cvId)}
              disabled={!cvId || selectedModes.length === 0 || parseMutation.isPending}
              className="btn-primary text-sm"
            >
              {parseMutation.isPending ? 'AI đang đọc CV (có thể mất ~30 giây)...' : 'Đọc CV'}
            </button>
          ) : (
            <button
              onClick={save}
              disabled={!canSave || importMutation.isPending}
              className="btn-primary text-sm"
            >
              {saveButtonLabel()}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
