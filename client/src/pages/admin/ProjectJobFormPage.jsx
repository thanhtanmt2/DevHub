import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi } from '@/api/workspaceApi';
import { projectJobApi } from '@/api/projectJobApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import MoneyInput from '@/components/common/MoneyInput';
import PageBanner from '@/components/common/PageBanner';
import { EXPERIENCE_LABELS, formatMoney, formatDate } from '@/utils/jobMeta';

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

export default function ProjectJobFormPage() {
  const { projectId, jobId } = useParams();
  const isEdit = Boolean(jobId);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [skillSearch, setSkillSearch] = useState('');
  const [initialized, setInitialized] = useState(!isEdit);

  const { data: projectRes, isLoading: projectLoading } = useQuery({
    queryKey: ['admin-project', projectId],
    queryFn: () => workspaceApi.getProjectById(projectId),
    enabled: !!projectId,
  });

  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-project-jobs', projectId],
    queryFn: () => projectJobApi.getAdminProjectJobs(projectId),
    enabled: !!projectId && isEdit,
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const project = projectRes?.data?.data;
  const projectJobs = useMemo(() => jobsRes?.data?.data || [], [jobsRes]);
  const editingJob = useMemo(
    () => (isEdit ? projectJobs.find((j) => j.id === jobId) || null : null),
    [isEdit, projectJobs, jobId]
  );
  const skills = useMemo(() => skillsRes?.data?.data || [], [skillsRes]);

  useEffect(() => {
    if (isEdit && editingJob && !initialized) {
      setJobForm({
        title: editingJob.title || '',
        description: editingJob.description || '',
        requirements: editingJob.requirements || '',
        benefits: editingJob.benefits || '',
        budget: editingJob.budget ? String(parseFloat(editingJob.budget)) : '',
        quantity: editingJob.quantity || 1,
        deadline: editingJob.deadline ? editingJob.deadline.slice(0, 10) : '',
        experience: editingJob.experience || '',
        skill_ids: editingJob.Skills?.map((sk) => sk.id) || [],
      });
      setInitialized(true);
    }
  }, [isEdit, editingJob, initialized]);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-projects'] });
    qc.invalidateQueries({ queryKey: ['project-jobs'] });
    if (projectId) {
      qc.invalidateQueries({ queryKey: ['admin-project', projectId] });
      qc.invalidateQueries({ queryKey: ['admin-project-jobs', projectId] });
    }
  };

  const createJobMutation = useMutation({
    mutationFn: (data) => projectJobApi.createAdminProjectJob(projectId, buildJobPayload(data)),
    onSuccess: (res) => {
      invalidateAll();
      const createdId = res.data?.data?.id;
      toast.success('Đã tạo vị trí công việc mới cho dự án!');
      navigate(createdId ? `/admin/projects/${projectId}/jobs?job=${createdId}` : `/admin/projects/${projectId}/jobs`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi thêm vị trí'),
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => projectJobApi.updateAdminProjectJob(id, data),
    onSuccess: (res) => {
      invalidateAll();
      toast.success(res.data?.message || 'Đã cập nhật vị trí tuyển dụng');
      navigate(`/admin/projects/${projectId}/jobs?job=${jobId}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật vị trí'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobForm.title.trim()) {
      toast.error('Vui lòng nhập tên vị trí công việc');
      return;
    }
    if (!(Number(jobForm.budget) >= 1000)) {
      toast.error('Thù lao vị trí tối thiểu 1.000đ');
      return;
    }
    if (isEdit && editingJob) {
      const payload = buildJobPayload(jobForm);
      if (editingJob.deadline && editingJob.deadline.slice(0, 10) === jobForm.deadline) {
        payload.deadline = editingJob.deadline;
      }
      updateJobMutation.mutate({ id: editingJob.id, data: payload });
    } else {
      createJobMutation.mutate(jobForm);
    }
  };

  const filteredSkills = useMemo(() => {
    const q = skillSearch.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((s) => s.name?.toLowerCase().includes(q));
  }, [skills, skillSearch]);

  const selectedSkillObjects = useMemo(
    () => skills.filter((s) => jobForm.skill_ids.includes(s.id)),
    [skills, jobForm.skill_ids]
  );

  if (projectLoading || (isEdit && jobsLoading)) return <LoadingSpinner />;

  if (!project || (isEdit && !editingJob)) {
    return (
      <div className="card text-center py-14">
        <IconBadge name="alert" tone="amber" size="lg" className="mx-auto mb-3" />
        <p className="font-semibold text-slate-800">
          {!project ? 'Không tìm thấy dự án' : 'Không tìm thấy vị trí tuyển dụng'}
        </p>
        <Link
          to={project ? `/admin/projects/${projectId}/jobs` : '/admin/projects'}
          className="btn-primary inline-block mt-4"
        >
          ← Quay lại
        </Link>
      </div>
    );
  }

  const isSaving = createJobMutation.isPending || updateJobMutation.isPending;
  const backUrl = `/admin/projects/${projectId}/jobs${isEdit ? `?job=${jobId}` : ''}`;

  return (
    <div className="space-y-6">
      <PageBanner
        compact
        icon="briefcase"
        title={isEdit ? `Chỉnh sửa vị trí: ${editingJob.title}` : 'Thêm vị trí tuyển dụng mới'}
        subtitle={`Dự án: ${project.name} · Hình thức: Làm việc từ xa (Remote)`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link to={backUrl} className="btn-light inline-flex items-center gap-1.5">
            <Icon name="chevronLeft" className="w-4 h-4" />
            Quay lại Vị trí & Ứng viên
          </Link>
          <Link to="/admin/projects" className="btn-glass inline-flex items-center gap-1.5">
            <Icon name="folder" className="w-4 h-4" />
            Danh sách dự án
          </Link>
        </div>
      </PageBanner>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-6 items-start">
        {/* Cột chính: Thông tin & Nội dung vị trí */}
        <div className="space-y-6 min-w-0">
          <section className="card !p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                <Icon name="briefcase" className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Thông tin cơ bản của vị trí</h2>
                <p className="text-xs text-slate-500">Tên vị trí, mức thù lao, chỉ tiêu số lượng và thời hạn nộp hồ sơ</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tên vị trí công việc <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field"
                placeholder="VD: Senior Frontend React Developer"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  <p className="mt-1 text-xs text-slate-500">
                    Thù lao trọn gói cho mỗi thành viên đảm nhận vị trí này khi dự án nghiệm thu.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Số lượng cần tuyển
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={jobForm.quantity}
                  onChange={(e) => setJobForm({ ...jobForm, quantity: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Số lượng ứng viên dự kiến duyệt vào Workspace cho vị trí này.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Hạn nộp hồ sơ
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={jobForm.deadline}
                  onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                />
                {project.expected_end_date && (
                  <p className="mt-1 text-xs text-slate-500">
                    Hạn hoàn thành dự kiến của dự án: {formatDate(project.expected_end_date)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Yêu cầu kinh nghiệm
                </label>
                <select
                  className="input-field"
                  value={jobForm.experience}
                  onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                >
                  <option value="">-- Không giới hạn / Chọn mức kinh nghiệm --</option>
                  {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="card !p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                <Icon name="document" className="w-4 h-4" />
              </span>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Chi tiết công việc & Yêu cầu</h2>
                <p className="text-xs text-slate-500">Nội dung hiển thị công khai cho ứng viên khi xem và ứng tuyển vị trí</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mô tả công việc
              </label>
              <textarea
                className="input-field resize-y"
                rows={5}
                placeholder={'Mô tả các hạng mục công việc ứng viên sẽ thực hiện trong dự án:\n- Xây dựng giao diện các màn hình theo thiết kế Figma\n- Tích hợp RESTful API cùng đội ngũ Backend...'}
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Yêu cầu ứng viên
              </label>
              <textarea
                className="input-field resize-y"
                rows={4}
                placeholder={'Ví dụ:\n- Thành thạo React, Tailwind CSS\n- Có kinh nghiệm làm việc nhóm qua Git\n- Chủ động cập nhật tiến độ task đúng hạn'}
                value={jobForm.requirements}
                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Quyền lợi được hưởng
              </label>
              <textarea
                className="input-field resize-y"
                rows={4}
                placeholder={'Ví dụ:\n- Nhận thù lao ngay sau khi dự án nghiệm thu hoàn thành\n- Được chấm điểm năng lực thực tế và cộng điểm xếp hạng hồ sơ trên DevHub'}
                value={jobForm.benefits}
                onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
              />
            </div>
          </section>
        </div>

        {/* Cột phải: Kỹ năng yêu cầu & Tóm tắt lưu */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          <section className="card !p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Icon name="badge" className="w-4 h-4 text-primary-600" />
                Kỹ năng yêu cầu ({jobForm.skill_ids.length})
              </h3>
              {jobForm.skill_ids.length > 0 && (
                <button
                  type="button"
                  onClick={() => setJobForm({ ...jobForm, skill_ids: [] })}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Bỏ chọn hết
                </button>
              )}
            </div>

            {selectedSkillObjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-primary-50/60 border border-primary-100">
                {selectedSkillObjects.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() =>
                      setJobForm({
                        ...jobForm,
                        skill_ids: jobForm.skill_ids.filter((id) => id !== skill.id),
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    {skill.name}
                    <Icon name="x" className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <Icon
                name="search"
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="text"
                className="input-field !pl-8 !py-1.5 text-xs"
                placeholder="Tìm nhanh kỹ năng..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-1">
              {filteredSkills.map((skill) => {
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
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                    }`}
                  >
                    {skill.name}
                  </button>
                );
              })}
              {filteredSkills.length === 0 && (
                <p className="text-xs text-slate-400 py-3 text-center w-full">
                  Không tìm thấy kỹ năng phù hợp.
                </p>
              )}
            </div>
          </section>

          <section className="card !p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Tóm tắt vị trí</h3>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Dự án:</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">{project.name}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Tên vị trí:</dt>
                <dd className="font-semibold text-slate-900 text-right truncate">{jobForm.title || '—'}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Thù lao:</dt>
                <dd className="font-bold text-emerald-700">
                  {Number(jobForm.budget) > 0 ? formatMoney(jobForm.budget) : '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Số lượng tuyển:</dt>
                <dd className="font-semibold text-slate-900">{jobForm.quantity || 1} người</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Hạn nộp:</dt>
                <dd className="font-semibold text-slate-900">
                  {jobForm.deadline ? formatDate(jobForm.deadline) : 'Không giới hạn'}
                </dd>
              </div>
            </dl>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="submit"
                disabled={!jobForm.title.trim() || !(Number(jobForm.budget) >= 1000) || isSaving}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                {isSaving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi vị trí' : 'Tạo vị trí tuyển dụng'}
              </button>
              <Link to={backUrl} className="btn-secondary w-full text-center">
                Hủy & Quay lại
              </Link>
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}
