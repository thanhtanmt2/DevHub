import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectJobApi } from '@/api/projectJobApi';
import { skillApi } from '@/api/skillApi';
import Icon from '@/components/common/Icon';
import MoneyInput from '@/components/common/MoneyInput';
import useEscapeKey from '@/hooks/useEscapeKey';
import { EXPERIENCE_LABELS } from '@/utils/jobMeta';

const EMPTY_JOB_FORM = {
  title: '',
  description: '',
  requirements: '',
  benefits: '',
  budget: '',
  quantity: 1,
  deadline: '',
  experience: '',
  skill_ids: [],
};

// Chuẩn hóa dữ liệu form gửi lên server (hạn nộp tính đến hết ngày được chọn)
const buildJobPayload = (form) => ({
  ...form,
  budget: parseFloat(form.budget) || 0,
  quantity: parseInt(form.quantity, 10) || 1,
  deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
});

export default function ProjectJobFormModal({ project, job = null, onClose }) {
  useEscapeKey(onClose);
  const qc = useQueryClient();

  const [jobForm, setJobForm] = useState(() => {
    if (!job) return EMPTY_JOB_FORM;
    return {
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      budget: job.budget ? String(parseFloat(job.budget)) : '',
      quantity: job.quantity || 1,
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
      experience: job.experience || '',
      skill_ids: job.Skills?.map((sk) => sk.id) || [],
    };
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });
  const skills = skillsRes?.data?.data || [];

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-projects'] });
    qc.invalidateQueries({ queryKey: ['project-jobs'] });
    if (project?.id) {
      qc.invalidateQueries({ queryKey: ['admin-project', project.id] });
      qc.invalidateQueries({ queryKey: ['admin-project-jobs', project.id] });
    }
  };

  const createJobMutation = useMutation({
    mutationFn: (data) => projectJobApi.createAdminProjectJob(project.id, buildJobPayload(data)),
    onSuccess: () => {
      invalidateAll();
      toast.success('Đã thêm vị trí công việc vào dự án!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi thêm vị trí'),
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => projectJobApi.updateAdminProjectJob(id, data),
    onSuccess: (res) => {
      invalidateAll();
      toast.success(res.data?.message || 'Đã cập nhật vị trí');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật vị trí'),
  });

  const submitJob = (e) => {
    e?.preventDefault();
    if (!jobForm.title.trim()) {
      toast.error('Vui lòng nhập tên vị trí công việc');
      return;
    }
    if (!(Number(jobForm.budget) >= 1000)) {
      toast.error('Thù lao vị trí tối thiểu 1.000đ');
      return;
    }
    if (job) {
      const payload = buildJobPayload(jobForm);
      // Không đổi ngày hạn thì giữ nguyên giá trị cũ (để vẫn lưu được các thay đổi khác trên vị trí đã hết hạn)
      if (job.deadline && job.deadline.slice(0, 10) === jobForm.deadline) {
        payload.deadline = job.deadline;
      }
      updateJobMutation.mutate({ id: job.id, data: payload });
    } else {
      createJobMutation.mutate(jobForm);
    }
  };

  const isSaving = createJobMutation.isPending || updateJobMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[60] p-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl animate-fade-in">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {job ? 'Sửa vị trí tuyển dụng' : 'Thêm vị trí tuyển dụng'}
            </h2>
            {project?.name && (
              <p className="text-xs text-primary-700 font-medium mt-0.5">
                Dự án: {project.name} · Làm việc từ xa
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submitJob} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên vị trí công việc <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field"
              placeholder="VD: Frontend React Developer"
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thù lao vị trí (VNĐ) <span className="text-red-500">*</span>
              </label>
              <MoneyInput
                required
                className="input-field"
                placeholder="10.000.000"
                value={jobForm.budget}
                onChange={(v) => setJobForm({ ...jobForm, budget: v })}
                aria-invalid={Number(jobForm.budget) > 0 && Number(jobForm.budget) < 1000}
              />
              {Number(jobForm.budget) > 0 && Number(jobForm.budget) < 1000 ? (
                <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
                  Thù lao tối thiểu 1.000đ.
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Thù lao cho mỗi người nhận vị trí này, hiển thị cho ứng viên khi ứng tuyển.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tuyển</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={jobForm.quantity}
                onChange={(e) => setJobForm({ ...jobForm, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp hồ sơ</label>
              <input
                type="date"
                className="input-field"
                value={jobForm.deadline}
                onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
              <select
                className="input-field"
                value={jobForm.experience}
                onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
              >
                <option value="">-- Chọn yêu cầu kinh nghiệm --</option>
                {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Các đầu việc chính của vị trí..."
              value={jobForm.description}
              onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu ứng viên</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder={'Ví dụ:\n- Thành thạo React, Tailwind CSS\n- Biết dùng Git'}
              value={jobForm.requirements}
              onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quyền lợi được hưởng</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder={'Ví dụ:\n- Thanh toán thù lao ngay khi nghiệm thu\n- Được đánh giá năng lực, cộng điểm hồ sơ'}
              value={jobForm.benefits}
              onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng yêu cầu</label>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {skills.map((skill) => {
                const selected = jobForm.skill_ids.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => {
                      const ids = selected
                        ? jobForm.skill_ids.filter((id) => id !== skill.id)
                        : [...jobForm.skill_ids, skill.id];
                      setJobForm({ ...jobForm, skill_ids: ids });
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Hủy
            </button>
            <button
              type="submit"
              disabled={!jobForm.title.trim() || !(Number(jobForm.budget) >= 1000) || isSaving}
              className="btn-primary disabled:opacity-50"
            >
              {isSaving ? 'Đang lưu...' : job ? 'Lưu thay đổi' : 'Tạo vị trí tuyển dụng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
