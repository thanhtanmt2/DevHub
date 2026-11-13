import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import {
  PROVINCES,
  EXPERIENCE_LABELS,
  LEVEL_LABELS,
  WORK_TYPE_LABELS,
  formatSalaryShort,
} from '@/utils/jobMeta';

const WORK_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];
const ACCEPTED_JD_FILES = '.pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp';

// Kiểm tra các trường bắt buộc trước khi đăng tin chính thức
export const getMissingJobFields = (job) => {
  const missing = [];
  if (!job?.title || !String(job.title).trim()) missing.push('tiêu đề công việc');
  if (!job?.work_type || !String(job.work_type).trim()) missing.push('hình thức làm việc');
  if (!job?.location || !String(job.location).trim()) missing.push('tỉnh/thành phố làm việc');
  if (!job?.description || !String(job.description).trim()) missing.push('mô tả công việc');
  return missing;
};

const INITIAL_FORM = {
  title: '',
  description: '',
  requirements: '',
  benefits: '',
  work_type: 'FULL_TIME',
  experience: '',
  position_level: '',
  location: '',
  work_address: '',
  working_time: '',
  salary_min: '',
  salary_max: '',
  quantity: 1,
  deadline: '',
  skill_ids: [],
};

const formFromJob = (job, isDuplicate = false) => {
  if (!job) return INITIAL_FORM;
  const rawDeadline = job.deadline ? job.deadline.slice(0, 16) : '';
  const validDeadline = isDuplicate && rawDeadline && new Date(rawDeadline) < new Date() ? '' : rawDeadline;
  return {
    title: isDuplicate ? `${job.title} (Bản sao)` : (job.title || ''),
    description: job.description || '',
    requirements: job.requirements || '',
    benefits: job.benefits || '',
    work_type: job.work_type || 'FULL_TIME',
    experience: job.experience || '',
    position_level: job.position_level || '',
    location: job.location || '',
    work_address: job.work_address || '',
    working_time: job.working_time || '',
    salary_min: job.salary_min || '',
    salary_max: job.salary_max || '',
    quantity: job.quantity || 1,
    deadline: validDeadline,
    skill_ids: job.Skills?.map((s) => s.id) || [],
  };
};

// Xây dựng danh sách các mục AI trích xuất được để hiển thị xem trước và chọn lọc
function buildAiFieldItems(aiData) {
  if (!aiData) return [];
  const items = [];
  if (aiData.title) {
    items.push({ key: 'title', label: 'Tiêu đề công việc', preview: aiData.title });
  }
  if (aiData.work_type && WORK_TYPE_LABELS[aiData.work_type]) {
    items.push({ key: 'work_type', label: 'Hình thức làm việc', preview: WORK_TYPE_LABELS[aiData.work_type] });
  }
  if (aiData.quantity && Number(aiData.quantity) > 0) {
    items.push({ key: 'quantity', label: 'Số lượng tuyển', preview: `${aiData.quantity} người` });
  }
  if (aiData.position_level && LEVEL_LABELS[aiData.position_level]) {
    items.push({ key: 'position_level', label: 'Cấp bậc', preview: LEVEL_LABELS[aiData.position_level] });
  }
  if (aiData.experience && EXPERIENCE_LABELS[aiData.experience]) {
    items.push({ key: 'experience', label: 'Kinh nghiệm', preview: EXPERIENCE_LABELS[aiData.experience] });
  }
  if (aiData.location) {
    items.push({ key: 'location', label: 'Tỉnh / Thành phố', preview: aiData.location });
  }
  if (aiData.work_address) {
    items.push({ key: 'work_address', label: 'Địa chỉ cụ thể', preview: aiData.work_address });
  }
  if (aiData.working_time) {
    items.push({ key: 'working_time', label: 'Thời gian làm việc', preview: aiData.working_time });
  }
  if (aiData.salary_min || aiData.salary_max) {
    items.push({
      key: 'salary',
      label: 'Mức lương',
      preview: formatSalaryShort(aiData.salary_min, aiData.salary_max),
    });
  }
  if (aiData.deadline) {
    items.push({
      key: 'deadline',
      label: 'Hạn nộp hồ sơ',
      preview: new Date(aiData.deadline).toLocaleDateString('vi-VN'),
    });
  }
  if (Array.isArray(aiData.skills) && aiData.skills.length > 0) {
    items.push({
      key: 'skill_ids',
      label: `Kỹ năng yêu cầu (${aiData.skills.length})`,
      preview: aiData.skills.map((s) => s.name).join(', '),
    });
  }
  if (aiData.description) {
    items.push({ key: 'description', label: 'Mô tả công việc', preview: aiData.description, multiline: true });
  }
  if (aiData.requirements) {
    items.push({ key: 'requirements', label: 'Yêu cầu ứng viên', preview: aiData.requirements, multiline: true });
  }
  if (aiData.benefits) {
    items.push({ key: 'benefits', label: 'Quyền lợi được hưởng', preview: aiData.benefits, multiline: true });
  }
  return items;
}

// Form đăng tin mới / sửa tin / nhân bản tin tuyển dụng (dùng ở danh sách tin và trang chi tiết tin)
export default function JobFormModal({
  job = null,
  mode = job ? 'edit' : 'create',
  autoOpenFilePicker = false,
  onClose,
}) {
  const qc = useQueryClient();
  const isDuplicate = mode === 'duplicate';
  const isEditingExisting = Boolean(job) && !isDuplicate;
  const [formData, setFormData] = useState(() => formFromJob(job, isDuplicate));
  const [snapshotBeforeAi, setSnapshotBeforeAi] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiFieldSel, setAiFieldSel] = useState({});
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const fileInputRef = useRef(null);
  const autoOpenedRef = useRef(false);

  useEscapeKey(onClose);

  const { data: skillsData } = useQuery({ queryKey: ['public-skills'], queryFn: skillApi.getPublicSkills });
  const skills = skillsData?.data?.data || [];

  useEffect(() => {
    if (autoOpenFilePicker && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      setTimeout(() => fileInputRef.current?.click(), 120);
    }
  }, [autoOpenFilePicker]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['employer-jobs'] });
    if (job?.id) qc.invalidateQueries({ queryKey: ['employer-job', job.id] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  // Áp dụng các mục AI đã chọn vào formData
  const applyAiFieldsToForm = (aiData, selectedKeysMap, baseForm) => {
    const next = { ...baseForm };
    if (selectedKeysMap.title && aiData.title) next.title = aiData.title;
    if (selectedKeysMap.work_type && aiData.work_type) next.work_type = aiData.work_type;
    if (selectedKeysMap.quantity && aiData.quantity) next.quantity = aiData.quantity;
    if (selectedKeysMap.position_level && aiData.position_level) next.position_level = aiData.position_level;
    if (selectedKeysMap.experience && aiData.experience) next.experience = aiData.experience;
    if (selectedKeysMap.location && aiData.location) next.location = aiData.location;
    if (selectedKeysMap.work_address && aiData.work_address) next.work_address = aiData.work_address;
    if (selectedKeysMap.working_time && aiData.working_time) next.working_time = aiData.working_time;
    if (selectedKeysMap.salary && (aiData.salary_min || aiData.salary_max)) {
      next.salary_min = aiData.salary_min || '';
      next.salary_max = aiData.salary_max || '';
    }
    if (selectedKeysMap.deadline && aiData.deadline) {
      next.deadline = aiData.deadline;
    }
    if (selectedKeysMap.skill_ids && Array.isArray(aiData.skill_ids) && aiData.skill_ids.length > 0) {
      next.skill_ids = [...new Set([...(baseForm.skill_ids || []), ...aiData.skill_ids])];
    }
    if (selectedKeysMap.description && aiData.description) next.description = aiData.description;
    if (selectedKeysMap.requirements && aiData.requirements) next.requirements = aiData.requirements;
    if (selectedKeysMap.benefits && aiData.benefits) next.benefits = aiData.benefits;
    return next;
  };

  const parseFileMut = useMutation({
    mutationFn: (file) => jobApi.parseJobFile(file),
    onSuccess: (res) => {
      const d = res.data?.data;
      const items = buildAiFieldItems(d);
      if (items.length === 0) {
        toast.error('AI không tìm thấy thông tin tuyển dụng nào trong file này');
        return;
      }
      const allSelected = Object.fromEntries(items.map((it) => [it.key, true]));
      setSnapshotBeforeAi((prev) => prev || formData);
      setAiResult(d);
      setAiFieldSel(allSelected);
      setFormData((cur) => applyAiFieldsToForm(d, allSelected, cur));
      toast.success(`AI đã lọc và điền ${items.length} mục thông tin từ file!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không đọc được file JD. Vui lòng thử lại.');
    },
  });

  const handleSelectFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng file tối đa là 10MB');
      return;
    }
    setUploadingFileName(file.name);
    parseFileMut.mutate(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    handleSelectFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer?.files?.[0];
    handleSelectFile(file);
  };

  const toggleAiField = (key) => {
    setAiFieldSel((prev) => {
      const nextSel = { ...prev, [key]: !prev[key] };
      if (aiResult && snapshotBeforeAi) {
        setFormData(applyAiFieldsToForm(aiResult, nextSel, snapshotBeforeAi));
      }
      return nextSel;
    });
  };

  const handleRestoreBeforeAi = () => {
    if (snapshotBeforeAi) {
      setFormData(snapshotBeforeAi);
    }
    setAiResult(null);
    setSnapshotBeforeAi(null);
    setShowAiDetails(false);
    toast.success('Đã khôi phục dữ liệu biểu mẫu trước khi lọc file');
  };

  const createMut = useMutation({
    mutationFn: (data) => jobApi.createJob(data),
    onSuccess: (res) => { refresh(); toast.success(res.data?.message || 'Đã tạo tin tuyển dụng'); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => jobApi.updateJob(id, data),
    onSuccess: (res) => { refresh(); toast.success(res.data?.message || 'Đã cập nhật tin tuyển dụng'); onClose(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật'),
  });

  const submitForm = (isDraft = false) => {
    // Validate thủ công — tránh HTML required bị khuất trong modal
    if (!formData.title.trim()) return toast.error('Vui lòng nhập tiêu đề công việc');
    if (!isDraft) {
      if (!formData.work_type) return toast.error('Vui lòng chọn hình thức làm việc');
      if (!formData.location) return toast.error('Vui lòng chọn tỉnh/thành phố làm việc');
      if (!formData.description.trim()) return toast.error('Vui lòng nhập mô tả công việc');
    }
    const oldDeadline = isEditingExisting ? (job?.deadline?.slice(0, 16) || '') : '';
    if (formData.deadline && (!isDraft || formData.deadline !== oldDeadline) && new Date(formData.deadline) < new Date()) {
      return toast.error('Hạn nộp hồ sơ phải sau thời điểm hiện tại');
    }
    if (formData.salary_min && formData.salary_max &&
        parseFloat(formData.salary_min) > parseFloat(formData.salary_max)) {
      return toast.error('Lương tối thiểu không được lớn hơn lương tối đa');
    }

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      quantity: parseInt(formData.quantity) || 1,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      is_draft: isDraft,
    };

    if (isEditingExisting) updateMut.mutate({ id: job.id, data: payload });
    else createMut.mutate(payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm(false);
  };

  const toggleSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skill_ids: prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter((id) => id !== skillId)
        : [...prev.skill_ids, skillId],
    }));
  };

  const saving = createMut.isPending || updateMut.isPending;
  const aiItems = buildAiFieldItems(aiResult);
  const selectedAiCount = aiItems.filter((it) => aiFieldSel[it.key]).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white rounded-t-xl">
          <h3 className="font-bold text-lg">
            {isDuplicate
              ? 'Nhân bản tin tuyển dụng'
              : isEditingExisting
              ? 'Sửa tin tuyển dụng'
              : 'Đăng tin tuyển dụng mới'}
          </h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Input file ẩn dùng cho tải file JD */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_JD_FILES}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Khung AI lọc thông tin từ file JD */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDrop}
            className={`rounded-xl border transition-all ${
              isDraggingFile
                ? 'border-primary-500 bg-primary-50/80 ring-2 ring-primary-500/20'
                : aiResult
                ? 'border-emerald-200 bg-emerald-50/40'
                : 'border-primary-200 bg-gradient-to-r from-primary-50/70 via-indigo-50/50 to-sky-50/60'
            } p-4`}
          >
            {parseFileMut.isPending ? (
              <div className="flex items-center gap-3.5 py-2">
                <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    AI đang đọc file &ldquo;{uploadingFileName}&rdquo; và lọc thông tin tuyển dụng...
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quá trình trích xuất tiêu đề, mức lương, kỹ năng, mô tả & yêu cầu có thể mất khoảng 10 – 25 giây.
                  </p>
                </div>
              </div>
            ) : !aiResult ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon name="sparkles" className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900">
                        Tải file JD — AI tự động lọc thông tin tuyển dụng
                      </p>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                        AI hỗ trợ
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Hỗ trợ file <b>.pdf, .docx, .txt, .md</b> hoặc ảnh chụp JD (<b>.png, .jpg</b>). Kéo thả file vào đây hoặc bấm nút để chọn file.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm shrink-0"
                >
                  <Icon name="upload" className="w-4 h-4" />
                  Chọn file JD
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Đã lọc {aiItems.length} mục thông tin từ file &ldquo;{aiResult.file_name}&rdquo;
                      </p>
                      <p className="text-xs text-slate-600">
                        Đang áp dụng <b>{selectedAiCount}/{aiItems.length}</b> mục vào biểu mẫu bên dưới. Bạn có thể chỉnh sửa trực tiếp hoặc bật/tắt từng mục.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAiDetails((v) => !v)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 transition-colors"
                    >
                      {showAiDetails ? 'Thu gọn chi tiết' : 'Xem & chọn mục'}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Tải file khác
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreBeforeAi}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hoàn tác dữ liệu AI vừa điền"
                    >
                      Hoàn tác
                    </button>
                  </div>
                </div>

                {aiResult.deadline_expired && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                    Hạn nộp hồ sơ ghi trong file đã qua thời điểm hiện tại nên được để trống. Vui lòng chọn hạn nộp mới nếu cần.
                  </p>
                )}

                {!showAiDetails ? (
                  <div className="flex flex-wrap gap-1.5">
                    {aiItems.map((it) => {
                      const active = !!aiFieldSel[it.key];
                      return (
                        <button
                          key={it.key}
                          type="button"
                          onClick={() => toggleAiField(it.key)}
                          title="Bấm để bật/tắt mục này"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? 'bg-white border-emerald-300 text-emerald-800'
                              : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                          }`}
                        >
                          <Icon name={active ? 'check' : 'x'} className="w-3 h-3" />
                          <span>{it.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 max-h-60 overflow-y-auto pr-1">
                    {aiItems.map((it) => {
                      const active = !!aiFieldSel[it.key];
                      return (
                        <label
                          key={it.key}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            it.multiline ? 'md:col-span-2' : ''
                          } ${
                            active
                              ? 'bg-white border-emerald-300 text-slate-800'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleAiField(it.key)}
                            className="mt-0.5 rounded text-emerald-600"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold block text-slate-900">{it.label}</span>
                            <span className="block text-slate-600 line-clamp-2 whitespace-pre-line mt-0.5">
                              {it.preview}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {isDuplicate && (
            <p className="text-sm text-primary-800 bg-primary-50 border border-primary-200 rounded-lg px-3 py-2">
              Toàn bộ nội dung và kỹ năng đã được sao chép từ tin gốc. Bạn có thể chỉnh sửa lại rồi chọn <strong>Lưu nháp</strong> hoặc <strong>Đăng tin</strong>.
            </p>
          )}
          {isEditingExisting && job?.status === 'HIDDEN' && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Tin này đã bị Admin từ chối. Sau khi bạn lưu chỉnh sửa, tin sẽ được <strong>gửi lại để Admin duyệt</strong>.
            </p>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề (Chức danh) <span className="text-red-500">*</span></label>
            <input type="text" required className="input-field" placeholder="Ví dụ: Lập trình viên Frontend (ReactJS)"
              value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hình thức <span className="text-red-500">*</span></label>
              <select className="input-field" required
                value={formData.work_type} onChange={e => setFormData({ ...formData, work_type: e.target.value })}
              >
                {WORK_TYPES.map(t => <option key={t} value={t}>{WORK_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số lượng tuyển</label>
              <input type="number" min="1" className="input-field"
                value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cấp bậc</label>
              <select className="input-field" value={formData.position_level}
                onChange={e => setFormData({ ...formData, position_level: e.target.value })}>
                <option value="">-- Chọn cấp bậc --</option>
                {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Kinh nghiệm</label>
              <select className="input-field" value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}>
                <option value="">-- Chọn yêu cầu kinh nghiệm --</option>
                {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
              <select className="input-field" value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}>
                <option value="">-- Chọn tỉnh/thành phố --</option>
                <option value="Toàn quốc">Toàn quốc / Remote</option>
                {formData.location && formData.location !== 'Toàn quốc' && !PROVINCES.includes(formData.location) && (
                  <option value={formData.location}>{formData.location}</option>
                )}
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ làm việc cụ thể</label>
              <input type="text" className="input-field" placeholder="Ví dụ: Tòa nhà FPT, Quận 9"
                value={formData.work_address} onChange={e => setFormData({ ...formData, work_address: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lương tối thiểu (VNĐ)</label>
              <input type="number" step="500000" className="input-field" placeholder="10000000"
                value={formData.salary_min} onChange={e => setFormData({ ...formData, salary_min: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lương tối đa (VNĐ)</label>
              <input type="number" step="500000" className="input-field" placeholder="20000000"
                value={formData.salary_max} onChange={e => setFormData({ ...formData, salary_max: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hạn chót nộp hồ sơ</label>
              <input type="datetime-local" className="input-field"
                value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian làm việc</label>
              <input type="text" className="input-field" placeholder="Ví dụ: Thứ 2 – Thứ 6 (8h30 – 17h30)"
                value={formData.working_time} onChange={e => setFormData({ ...formData, working_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kỹ năng yêu cầu</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-gray-50">
              {skills.map(s => {
                const isSelected = formData.skill_ids.includes(s.id);
                return (
                  <button type="button" key={s.id} onClick={() => toggleSkill(s.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      isSelected ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả công việc <span className="text-red-500">*</span></label>
            <textarea required rows="6" className="input-field text-sm" placeholder={'Các đầu việc chính, ví dụ:\n- Phát triển giao diện web với ReactJS\n- Phối hợp với backend để tích hợp API'}
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Yêu cầu ứng viên</label>
            <textarea rows="5" className="input-field text-sm" placeholder={'Ví dụ:\n- Có ít nhất 1 năm kinh nghiệm ReactJS\n- Biết Git, làm việc nhóm tốt'}
              value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quyền lợi được hưởng</label>
            <textarea rows="5" className="input-field text-sm" placeholder={'Ví dụ:\n- Thưởng tháng 13, thưởng dự án\n- Bảo hiểm đầy đủ, du lịch hằng năm'}
              value={formData.benefits} onChange={e => setFormData({ ...formData, benefits: e.target.value })}
            ></textarea>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            {(!isEditingExisting || job?.status === 'DRAFT') && (
              <button
                type="button"
                disabled={saving || parseFileMut.isPending}
                onClick={() => submitForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu nháp'}
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={saving || parseFileMut.isPending}>
              {saving
                ? 'Đang xử lý...'
                : !isEditingExisting || job?.status === 'DRAFT'
                ? 'Đăng tin (Gửi duyệt)'
                : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
