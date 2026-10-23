import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import PageBanner from '@/components/common/PageBanner';
import {
  PROVINCES, EXPERIENCE_LABELS, LEVEL_LABELS, shortLocation,
} from '@/utils/jobMeta';

const WORK_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];
const WORK_TYPE_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', REMOTE: 'Remote', FREELANCE: 'Freelance' };

const STATUS_LABELS = {
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  OPEN: 'Đang tuyển',
  HIDDEN: 'Đang ẩn',
  CLOSED: 'Đã đóng'
};
const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  OPEN: 'bg-green-100 text-green-800',
  HIDDEN: 'bg-gray-100 text-gray-500',
  CLOSED: 'bg-red-100 text-red-800'
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
  skill_ids: []
};

export default function ManageJobsPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  useEscapeKey(() => { setShowModal(false); setEditingId(null); }, showModal);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: jobApi.getMyJobs
  });
  
  const { data: skillsData } = useQuery({
    queryKey: ['public-skills'],
    queryFn: skillApi.getPublicSkills
  });

  const jobs = jobsData?.data?.data || [];
  const skills = skillsData?.data?.data || [];  // axios: response.data = { success, data: [...] }

  const createMut = useMutation({
    mutationFn: (data) => jobApi.createJob(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Đã tạo tin tuyển dụng');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => jobApi.updateJob(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Đã cập nhật tin tuyển dụng');
      closeModal();
    },
    onError: (err) => {
      console.error('Update job error:', err.response?.status, err.response?.data);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    }
  });

  const closeJobMut = useMutation({
    mutationFn: (id) => jobApi.closeJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Đã đóng tin tuyển dụng');
    }
  });

  const openCreateModal = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (job) => {
    setFormData({
      title: job.title,
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
      deadline: job.deadline ? job.deadline.slice(0, 16) : '',
      skill_ids: job.Skills?.map(s => s.id) || []
    });
    setEditingId(job.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate thủ công — tránh HTML required bị khuất trong modal
    if (!formData.title.trim()) return toast.error('Vui lòng nhập tiêu đề công việc');
    if (!formData.description.trim()) return toast.error('Vui lòng nhập mô tả công việc');
    if (!formData.work_type) return toast.error('Vui lòng chọn hình thức làm việc');
    if (!formData.location) return toast.error('Vui lòng chọn tỉnh/thành phố làm việc');
    const oldDeadline = editingId ? jobs.find((j) => j.id === editingId)?.deadline?.slice(0, 16) : '';
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
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    if (editingId) {
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const toggleSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      skill_ids: prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter(id => id !== skillId)
        : [...prev.skill_ids, skillId]
    }));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageBanner compact icon="briefcase" title="Quản lý tin tuyển dụng" subtitle="Đăng tin và quản lý các cơ hội việc làm của doanh nghiệp">
        <button onClick={openCreateModal} className="btn-light">
          + Đăng tin mới
        </button>
      </PageBanner>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-primary-50/60 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Tiêu đề / Chức danh</th>
              <th className="px-4 py-3 font-medium text-gray-700">Hình thức</th>
              <th className="px-4 py-3 font-medium text-gray-700">Hạn nộp</th>
              <th className="px-4 py-3 font-medium text-gray-700">Lượt xem</th>
              <th className="px-4 py-3 font-medium text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-gray-700 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  Bạn chưa có tin tuyển dụng nào.
                </td>
              </tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{job.title}</div>
                    {job.location && <div className="text-xs text-gray-500 mt-0.5">{shortLocation(job.location)}</div>}
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                      {job.Skills?.map(s => (
                        <span key={s.id} className="bg-gray-100 border px-1.5 py-0.5 rounded">{s.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">{WORK_TYPE_LABELS[job.work_type]}</td>
                  <td className="px-4 py-3">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "--"}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary-600">{job.view_count || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                      {STATUS_LABELS[job.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link to={`/employer/applications?job_id=${job.id}`} className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                      Hồ sơ
                    </Link>
                    <button onClick={() => openEditModal(job)} className="text-gray-600 hover:text-blue-600 font-medium">
                      Sửa
                    </button>
                    {job.status !== 'CLOSED' && (
                      <button onClick={async () => {
                        if (await confirm({ title: 'Đóng tin tuyển dụng', message: 'Ứng viên sẽ không thể nộp thêm hồ sơ vào tin này.', confirmText: 'Đóng tin', tone: 'danger' })) closeJobMut.mutate(job.id);
                      }} className="text-red-500 hover:text-red-700 hover:underline font-medium">
                        Đóng
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-bold text-lg">{editingId ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}</h3>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                    )
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

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={closeModal} className="btn-secondary">Hủy</button>
                <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
                  {(createMut.isPending || updateMut.isPending) ? 'Đang lưu...' : 'Lưu tin tuyển dụng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
