import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import useEscapeKey from '@/hooks/useEscapeKey';
import { PROVINCES, EXPERIENCE_LABELS, LEVEL_LABELS, WORK_TYPE_LABELS } from '@/utils/jobMeta';

const WORK_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];

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
    title: isDuplicate ? `${job.title} (Bản sao)` : job.title,
    description: job.description,
    requirements: job.requirements || '',
    benefits: job.benefits || '',
    work_type: job.work_type,
    experience: job.experience || '',
    position_level: job.position_level || '',
    location: job.location || '',
    work_address: job.work_address || '',
    working_time: job.working_time || '',
    salary_min: job.salary_min || '',
    salary_max: job.salary_max || '',
    quantity: job.quantity,
    deadline: validDeadline,
    skill_ids: job.Skills?.map((s) => s.id) || [],
  };
};

// Form đăng tin mới / sửa tin / nhân bản tin tuyển dụng (dùng ở danh sách tin và trang chi tiết tin)
export default function JobFormModal({ job = null, mode = job ? 'edit' : 'create', onClose }) {
  const qc = useQueryClient();
  const isDuplicate = mode === 'duplicate';
  const isEditingExisting = Boolean(job) && !isDuplicate;
  const [formData, setFormData] = useState(() => formFromJob(job, isDuplicate));
  useEscapeKey(onClose);

  const { data: skillsData } = useQuery({ queryKey: ['public-skills'], queryFn: skillApi.getPublicSkills });
  const skills = skillsData?.data?.data || [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['employer-jobs'] });
    if (job?.id) qc.invalidateQueries({ queryKey: ['employer-job', job.id] });
    qc.invalidateQueries({ queryKey: ['notifications'] });
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
    if (!formData.description.trim()) return toast.error('Vui lòng nhập mô tả công việc');
    if (!isDraft) {
      if (!formData.work_type) return toast.error('Vui lòng chọn hình thức làm việc');
      if (!formData.location) return toast.error('Vui lòng chọn tỉnh/thành phố làm việc');
    }
    const oldDeadline = isEditingExisting ? (job?.deadline?.slice(0, 16) || '') : '';
    if (formData.deadline && formData.deadline !== oldDeadline && new Date(formData.deadline) < new Date()) {
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                disabled={saving}
                onClick={() => submitForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu nháp'}
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={saving}>
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
