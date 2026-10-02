import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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
  work_type: 'FULL_TIME',
  location: '',
  salary_min: '',
  salary_max: '',
  quantity: 1,
  deadline: '',
  skill_ids: []
};

export default function ManageJobsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

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
      console.error('❌ Update job error:', err.response?.status, err.response?.data);
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
      work_type: job.work_type,
      location: job.location || '',
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
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>
          <p className="text-gray-500 mt-1">Đăng tin và quản lý các cơ hội việc làm của doanh nghiệp</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          + Đăng tin mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
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
                      <button onClick={() => {
                        if(confirm("Bạn có chắc muốn đóng tin này? Ứng viên sẽ không thể nộp thêm hồ sơ.")) closeJobMut.mutate(job.id);
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Địa điểm làm việc</label>
                <input type="text" className="input-field" placeholder="Ví dụ: Quận 1, TP. HCM (Để trống nếu Remote)"
                  value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hạn chót nộp hồ sơ</label>
                <input type="datetime-local" className="input-field"
                  value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả công việc & Yêu cầu <span className="text-red-500">*</span></label>
                <textarea required rows="8" className="input-field font-mono text-sm" placeholder="Nhập mô tả chi tiết công việc..."
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
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
