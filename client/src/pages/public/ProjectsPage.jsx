import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { projectJobApi } from '@/api/projectJobApi';
import { candidateApi } from '@/api/candidateApi';
import { skillApi } from '@/api/skillApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import { SkillTag } from '@/components/common/Badges';
import ProjectJobDetailView from '@/components/job/ProjectJobDetailView';
import { DeadlineChip, MetaItem } from '@/components/job/JobParts';
import { timeAgo } from '@/utils/timeAgo';
import { EXPERIENCE_LABELS, deadlineInfo } from '@/utils/jobMeta';

const SORTS = [
  { value: 'newest', label: 'Mới đăng nhất' },
  { value: 'deadline', label: 'Sắp hết hạn' },
  { value: 'budget', label: 'Thù lao cao nhất' },
];
const EMPTY_FILTERS = { skill_id: '', experience: '', sort: 'newest' };
const selectCls = 'h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400';

const formatSalary = (amount) => {
  if (!amount) return 'Thỏa thuận';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function ProjectsPage() {
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Từ khóa / kỹ năng có thể đến từ trang chủ qua đường dẫn (?keyword=...&skill_id=...)
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    keyword: initialKeyword,
    skill_id: searchParams.get('skill_id') || '',
    page: 1,
  });
  const setFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  const [activeDetailJob, setActiveDetailJob] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  useEscapeKey(() => setSelectedJobForApply(null), !!selectedJobForApply);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', cv_url: '' });

  // Debounce keyword: chờ 400ms sau khi người dùng ngừng gõ mới gửi request
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, isLoading } = useQuery({
    queryKey: ['project-jobs', filters],
    queryFn: () => projectJobApi.getProjectJobs(filters),
    keepPreviousData: true,
  });

  const { data: myAppsRes } = useQuery({
    queryKey: ['my-project-applications'],
    queryFn: () => projectJobApi.getMyProjectApplications(),
    enabled: !!user && isCandidate(),
  });

  const { data: profileRes } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
    enabled: !!user && isCandidate(),
  });

  const profile = profileRes?.data?.data;
  const appliedJobIds = new Set(myAppsRes?.data?.data?.map((a) => a.project_job_id) || []);

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, data }) => projectJobApi.applyProjectJob(jobId, data),
    onSuccess: () => {
      toast.success('Nộp đơn ứng tuyển dự án thành công!');
      setSelectedJobForApply(null);
      setApplyForm({ cover_letter: '', cv_url: '' });
      qc.invalidateQueries({ queryKey: ['project-jobs'] });
      qc.invalidateQueries({ queryKey: ['my-project-applications'] });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn');
    }
  });

  const handleApplyClick = (e, job) => {
    e.stopPropagation(); // prevent card click
    if (!user) {
      openLoginModal();
      return;
    }
    if (!isCandidate()) {
      toast.error('Chỉ tài khoản Ứng viên mới có thể nộp đơn dự án');
      return;
    }
    if (deadlineInfo(job.deadline).expired) {
      toast.error('Vị trí dự án này đã hết hạn nộp hồ sơ');
      return;
    }
    if (!profile) {
      toast.error(
        <span>
          Bạn cần tạo hồ sơ ứng viên trước.{' '}
          <a href="/candidate/profile" className="underline font-semibold">Tạo ngay →</a>
        </span>,
        { duration: 5000 }
      );
      return;
    }
    setSelectedJobForApply(job);
    setApplyForm({
      cover_letter: '',
      cv_url: profile?.cv_url || ''
    });
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    if (!applyForm.cv_url) {
      toast.error('Vui lòng chọn hoặc tải lên file CV để nộp hồ sơ');
      return;
    }
    applyMutation.mutate({ jobId: selectedJobForApply.id, data: applyForm });
  };

  const projectJobs = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const skills = skillsRes?.data?.data || [];

  const activeFilterCount = ['skill_id', 'experience'].filter((k) => filters[k]).length + (filters.keyword ? 1 : 0);
  const resetFilters = () => {
    setKeyword('');
    setFilters({ ...EMPTY_FILTERS, keyword: '', page: 1 });
  };

  // Màn hình rộng: xem nhanh ở khung bên phải. Màn hình nhỏ: sang trang chi tiết riêng.
  const openJob = (job) => {
    if (window.matchMedia('(min-width: 1024px)').matches) setActiveDetailJob(job);
    else navigate(`/projects/${job.id}`);
  };

  const panelAction = (job) => {
    if (appliedJobIds.has(job.id)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
          <Icon name="check" className="w-4 h-4" strokeWidth={2.5} /> Đã nộp hồ sơ
        </span>
      );
    }
    const expired = deadlineInfo(job.deadline).expired;
    return (
      <button onClick={(e) => handleApplyClick(e, job)} disabled={expired} className="btn-primary px-6 py-2.5 whitespace-nowrap">
        {expired ? 'Đã hết hạn nộp hồ sơ' : 'Ứng tuyển vị trí này'}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Banner + tìm kiếm */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-6 sm:p-8 mb-6 shadow-lift">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dự án thời vụ</h1>
          <p className="mt-1.5 text-white text-sm sm:text-base">Nhận các dự án Freelance, Remote, Part-time và làm việc ngay trong Workspace của DevHub</p>

          <div className="mt-5 bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-xl max-w-5xl">
            <div className="relative flex-1">
              <Icon name="search" className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full h-11 pl-10 pr-3 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/40"
                placeholder="Tìm vị trí công việc, dự án..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <select
              aria-label="Kỹ năng"
              className="h-11 px-3 rounded-xl bg-slate-50 text-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/40 md:w-52"
              value={filters.skill_id}
              onChange={(e) => setFilter({ skill_id: e.target.value })}
            >
              <option value="">Tất cả kỹ năng</option>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* Thanh bộ lọc + số kết quả */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <p className="text-sm text-gray-500">
          Tìm thấy <strong className="text-slate-800">{pagination?.total || 0}</strong> vị trí dự án thời vụ (làm việc từ xa)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Kinh nghiệm" className={selectCls} value={filters.experience} onChange={(e) => setFilter({ experience: e.target.value })}>
            <option value="">Kinh nghiệm</option>
            {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select aria-label="Sắp xếp" className={selectCls} value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="h-10 px-3 text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <LoadingSpinner />
      ) : projectJobs.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <IconBadge name="search" size="lg" className="mx-auto mb-2" />
          <p>Không tìm thấy vị trí dự án phù hợp</p>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="mt-3 text-sm text-primary-600 font-medium hover:underline">Xóa bộ lọc để xem tất cả</button>
          )}
        </div>
      ) : (
        <div className={`flex flex-col ${activeDetailJob ? 'lg:flex-row gap-6' : ''}`}>
          {/* Danh sách vị trí */}
          <div className={`${activeDetailJob ? 'w-full lg:w-[42%] flex-shrink-0' : 'w-full'} space-y-4`}>
            {projectJobs.map((job) => {
              const isSelected = activeDetailJob?.id === job.id;
              const isApplied = appliedJobIds.has(job.id);
              const expired = deadlineInfo(job.deadline).expired;

              return (
                <div
                  key={job.id}
                  onClick={() => openJob(job)}
                  className={`card cursor-pointer transition-all duration-200 border-2 border-l-4 ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/30 shadow-md'
                      : 'border-transparent border-l-primary-400 hover:border-primary-200 hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-lg text-gray-900 leading-snug">{job.title}</h3>
                        <span className="text-primary-700 font-bold whitespace-nowrap">{formatSalary(job.budget)}</span>
                      </div>

                      <p className="text-sm font-medium text-primary-700 mt-0.5 flex items-center gap-1.5">
                        <Icon name="folder" className="w-4 h-4" />{job.Project?.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                        <MetaItem icon="globe">Làm việc từ xa</MetaItem>
                        <MetaItem icon="clock">{EXPERIENCE_LABELS[job.experience]}</MetaItem>
                        <MetaItem icon="users">{job.quantity > 1 ? `${job.quantity} người` : ''}</MetaItem>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mt-2.5">{job.description}</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.Skills?.slice(0, 4).map((s) => <SkillTag key={s.id} name={s.name} />)}
                        {job.Skills?.length > 4 && <span className="text-xs text-gray-400 self-center">+{job.Skills.length - 4}</span>}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-primary-50 text-primary-700 ring-primary-200">
                            <Icon name="sparkles" className="w-3.5 h-3.5" />Dự án thời vụ
                          </span>
                          <DeadlineChip deadline={job.deadline} />
                        </div>
                        <div className="flex items-center gap-3">
                          {job.created_at && <span className="text-xs text-slate-400">Đăng {timeAgo(job.created_at)}</span>}
                          {isApplied ? (
                            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 inline-flex items-center gap-1">
                              <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} /> Đã ứng tuyển
                            </span>
                          ) : (
                            <button
                              onClick={(e) => handleApplyClick(e, job)}
                              disabled={expired}
                              className="btn-primary text-xs py-1.5 px-4 whitespace-nowrap"
                            >
                              {expired ? 'Hết hạn' : 'Ứng tuyển'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters({ ...filters, page: p })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      p === filters.page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Khung xem nhanh chi tiết (màn hình rộng) */}
          {activeDetailJob && (
            <div className="hidden lg:block flex-1 min-w-0 sticky top-20 self-start animate-fade-in">
              <div className="card border border-primary-200 shadow-xl bg-white max-h-[calc(100vh-110px)] overflow-y-auto">
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-gray-100">
                  <Link to={`/projects/${activeDetailJob.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline">
                    <Icon name="external" className="w-4 h-4" />Mở trang chi tiết
                  </Link>
                  <button
                    onClick={() => setActiveDetailJob(null)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Đóng khung chi tiết"
                    aria-label="Đóng"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>
                <ProjectJobDetailView compact job={activeDetailJob} action={panelAction(activeDetailJob)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Ứng tuyển vị trí dự án</h2>
            <p className="text-sm font-medium text-primary-600 mb-1">{selectedJobForApply.title}</p>
            <p className="text-xs text-gray-500 mb-4"><Icon name="folder" className="w-3.5 h-3.5 mr-1" />Dự án: {selectedJobForApply.Project?.name}</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thư giới thiệu (Cover Letter)
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  required
                  placeholder="Giới thiệu năng lực, kinh nghiệm thực chiến và cam kết hoàn thành dự án..."
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                />
              </div>

              {/* CV Selector */}
              <CvSelector
                profile={profile}
                value={applyForm.cv_url}
                onChange={(url) => setApplyForm({ ...applyForm, cv_url: url })}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="btn-secondary"
                  disabled={applyMutation.isPending}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? 'Đang gửi...' : 'Xác nhận nộp đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
