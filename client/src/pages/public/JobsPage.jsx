import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import { candidateApi } from '@/api/candidateApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CompanyLogo from '@/components/common/CompanyLogo';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import { SkillTag, WorkTypeBadge } from '@/components/common/Badges';
import JobDetailView from '@/components/job/JobDetailView';
import { DeadlineChip, MetaItem, AppliedBadge } from '@/components/job/JobParts';
import SaveJobButton from '@/components/job/SaveJobButton';
import { SearchBand, BandSelect, FilterSidebar, FilterGroup, RadioList, ResultsHeader, sideSelectCls } from '@/components/job/JobListFilters';
import { timeAgo } from '@/utils/timeAgo';
import {
  PROVINCES, LOCATION_ANYWHERE, EXPERIENCE_LABELS, LEVEL_LABELS, SALARY_RANGES, WORK_TYPE_LABELS,
  formatSalaryShort, shortLocation, deadlineInfo,
} from '@/utils/jobMeta';

const WORK_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];
const CHIP_LABELS = { '': 'Tất cả', ...WORK_TYPE_LABELS };

const SORTS = [
  { value: 'newest', label: 'Mới đăng nhất' },
  { value: 'deadline', label: 'Sắp hết hạn' },
  { value: 'salary', label: 'Lương cao nhất' },
];

const EMPTY_FILTERS = { work_type: '', skill_id: '', location: '', experience: '', position_level: '', salary: '', sort: 'newest' };


export default function JobsPage() {
  const navigate = useNavigate();
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();

  // Từ khóa / kỹ năng có thể đến từ trang chủ qua đường dẫn (?keyword=...&skill_id=...)
  const [searchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';

  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    keyword: initialKeyword,
    skill_id: searchParams.get('skill_id') || '',
    location: searchParams.get('location') || '',
    page: 1,
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false); // bộ lọc nâng cao trên điện thoại
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  useEscapeKey(() => setSelectedJobForApply(null), !!selectedJobForApply);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', cv_url: '' });

  const setFilter = (patch) => setFilters((prev) => ({ ...prev, ...patch, page: 1 }));

  // Bản nháp: từ khóa + ô chọn trên dải tìm kiếm chỉ đổi bản nháp, bấm "Tìm kiếm" mới áp dụng vào `filters` và gọi API. Lọc nâng cao bên trái áp dụng ngay (setBoth).
  const DRAFT_KEYS = ['keyword', 'location', 'skill_id', 'work_type', 'salary', 'experience', 'position_level'];
  const pickDraft = (f) => Object.fromEntries(DRAFT_KEYS.map((k) => [k, f[k] ?? '']));
  const [draft, setDraft] = useState(() => pickDraft(filters));
  const setD = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setBoth = (patch) => { setD(patch); setFilter(patch); }; // lọc bên trái: áp dụng ngay
  const applySearch = () => {
    setFilters((prev) => ({ ...prev, ...draft, keyword: draft.keyword.trim(), page: 1 }));
    setFilterOpen(false);
  };


  // Chuyển bộ lọc trên giao diện sang tham số của API
  const params = (() => {
    const { salary, ...rest } = filters;
    const range = SALARY_RANGES.find((r) => r.key === salary);
    return { ...rest, salary_from: range?.from || undefined, salary_to: range?.to || undefined };
  })();

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobApi.getJobs(params),
    keepPreviousData: true,
  });

  const { data: profileRes } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
    enabled: !!user && isCandidate(),
  });

  const { data: myAppsRes } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
    enabled: !!user && isCandidate(),
  });

  const profile = profileRes?.data?.data;
  const myApps = myAppsRes?.data?.data || [];
  const appliedByJob = new Map(myApps.map((a) => [a.job_post_id, a])); // tin → hồ sơ đã nộp

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, data }) => jobApi.apply({ job_post_id: jobId, ...data }),
    onSuccess: () => {
      toast.success('Nộp đơn ứng tuyển thành công!');
      setSelectedJobForApply(null);
      setApplyForm({ cover_letter: '', cv_url: '' });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn');
    },
  });

  const jobs = data?.data?.data || [];
  // Ứng viên đã khai kỹ năng: server trả personalized + độ phù hợp từng tin; mặc định xếp "Phù hợp với bạn" lên đầu
  const personalized = !!data?.data?.personalized;
  const sorts = personalized ? [{ value: 'match', label: 'Phù hợp với bạn' }, ...SORTS] : SORTS;
  const autoSorted = useRef(false);
  useEffect(() => {
    if (!personalized || autoSorted.current) return;
    autoSorted.current = true;
    if (filters.sort === 'newest') setFilter({ sort: 'match' });
  }, [personalized]); // eslint-disable-line react-hooks/exhaustive-deps
  const pagination = data?.data?.pagination;
  const skills = skillsRes?.data?.data || [];

  const activeFilterCount = ['work_type', 'skill_id', 'location', 'experience', 'position_level', 'salary']
    .filter((k) => filters[k]).length + (filters.keyword ? 1 : 0);

  const resetFilters = () => {
    setDraft(pickDraft({ ...EMPTY_FILTERS, keyword: '' }));
    setFilters({ ...EMPTY_FILTERS, keyword: '', page: 1 });
    setFilterOpen(false);
  };

  const handleApplyClick = (job) => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (!isCandidate()) {
      toast.error('Chỉ tài khoản Ứng viên mới có thể nộp đơn');
      return;
    }
    if (deadlineInfo(job.deadline).expired) {
      toast.error('Tin tuyển dụng này đã hết hạn nộp hồ sơ');
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
    setApplyForm({ cover_letter: '', cv_url: profile?.cv_url || '' });
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

  // Màn hình rộng: xem nhanh ở khung bên phải. Màn hình nhỏ: sang trang chi tiết riêng.
  const openJob = (job) => {
    if (window.matchMedia('(min-width: 1024px)').matches) setSelectedJob(job);
    else navigate(`/jobs/${job.id}`);
  };

  const applyButton = (job) => {
    const expired = deadlineInfo(job.deadline).expired;
    if (appliedByJob.has(job.id)) {
      return <AppliedBadge application={appliedByJob.get(job.id)} className="!px-4 !py-2 !text-sm" />;
    }
    return (
      <button onClick={() => handleApplyClick(job)} disabled={expired} className="btn-primary px-6 py-2.5 whitespace-nowrap">
        {expired ? 'Đã hết hạn nộp hồ sơ' : 'Ứng tuyển ngay'}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-8">
      <SearchBand
        title="Việc làm tại doanh nghiệp"
        keyword={draft.keyword}
        onKeyword={(v) => setD({ keyword: v })}
        onSubmit={applySearch}
        placeholder="Tìm theo vị trí, công nghệ, công ty..."
      >
        <BandSelect icon="mapPin" aria-label="Địa điểm" value={draft.location} onChange={(e) => setD({ location: e.target.value })}>
          <option value="">Tất cả địa điểm</option>
          <option value={LOCATION_ANYWHERE}>Toàn quốc / Remote</option>
          <optgroup label="Tỉnh / Thành phố">
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </optgroup>
        </BandSelect>
      </SearchBand>

      <div className="mt-5 grid lg:grid-cols-[17rem_minmax(0,1fr)] gap-6">
        <FilterSidebar open={filterOpen} activeCount={activeFilterCount} onReset={resetFilters}>
          <FilterGroup title="Hình thức làm việc">
            <RadioList name="work_type" value={draft.work_type} onChange={(v) => setBoth({ work_type: v })}
              options={WORK_TYPES.map((t) => ({ value: t, label: CHIP_LABELS[t] }))} />
          </FilterGroup>
          <FilterGroup title="Kỹ năng">
            <select aria-label="Kỹ năng" className={sideSelectCls} value={draft.skill_id} onChange={(e) => setBoth({ skill_id: e.target.value })}>
              <option value="">Tất cả kỹ năng</option>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FilterGroup>
          <FilterGroup title="Mức lương">
            <RadioList name="salary" value={draft.salary} onChange={(v) => setBoth({ salary: v })}
              options={SALARY_RANGES.map((r) => ({ value: r.key, label: r.key === '' ? 'Tất cả' : r.label }))} />
          </FilterGroup>
          <FilterGroup title="Kinh nghiệm">
            <RadioList name="experience" value={draft.experience} onChange={(v) => setBoth({ experience: v })}
              options={[{ value: '', label: 'Tất cả' }, ...Object.entries(EXPERIENCE_LABELS).map(([k, v]) => ({ value: k, label: v }))]} />
          </FilterGroup>
          <FilterGroup title="Cấp bậc">
            <RadioList name="position_level" value={draft.position_level} onChange={(v) => setBoth({ position_level: v })}
              options={[{ value: '', label: 'Tất cả' }, ...Object.entries(LEVEL_LABELS).map(([k, v]) => ({ value: k, label: v }))]} />
          </FilterGroup>
        </FilterSidebar>

        <div className="min-w-0">
          <ResultsHeader
            count={<>Tìm thấy <strong className="text-slate-900">{pagination?.total || 0}</strong> công việc{filters.location && filters.location !== LOCATION_ANYWHERE && <> tại <strong className="text-slate-900">{filters.location}</strong></>}</>}
            sort={filters.sort} sortOptions={sorts} onSort={(v) => setFilter({ sort: v })}
            filtersOpen={filterOpen} onToggleFilters={() => setFilterOpen((o) => !o)} activeCount={activeFilterCount}
          />
      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <IconBadge name="search" size="lg" className="mx-auto mb-2" />
          <p>Không tìm thấy công việc phù hợp</p>
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} className="mt-3 text-sm text-primary-700 font-medium hover:underline">Xóa bộ lọc để xem tất cả</button>
          )}
        </div>
      ) : (
        <div className={`flex flex-col ${selectedJob ? 'lg:flex-row gap-6' : ''}`}>
          {/* Danh sách công việc */}
          <div className={`${selectedJob ? 'w-full lg:w-[42%] flex-shrink-0' : 'w-full'} space-y-3`}>
            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const applied = appliedByJob.get(job.id);
              // Chưa nộp tin này nhưng đã nộp tin khác của cùng công ty
              const otherAtCompany = applied || !job.Company ? 0
                : myApps.filter((a) => a.JobPost?.Company?.id === job.Company.id).length;
              return (
                <div
                  key={job.id}
                  onClick={() => openJob(job)}
                  className={`card !p-4 cursor-pointer transition-all duration-200 border-2 border-l-4 ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/30 shadow-md'
                      : 'border-transparent border-l-primary-400 hover:border-primary-200 hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <CompanyLogo company={job.Company} className="w-12 h-12 text-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-base text-gray-900 hover:text-primary-700 leading-snug">{job.title}</h3>
                        <span className="text-primary-700 font-bold whitespace-nowrap">{formatSalaryShort(job.salary_min, job.salary_max)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        {job.Company && <p className="text-sm text-gray-500 uppercase tracking-wide truncate">{job.Company.name}</p>}
                        {applied && <AppliedBadge application={applied} />}
                        {otherAtCompany > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                            <Icon name="info" className="w-3.5 h-3.5" />Bạn đã ứng tuyển {otherAtCompany} vị trí khác tại công ty này
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <MetaItem icon="mapPin">{shortLocation(job.location) || 'Toàn quốc'}</MetaItem>
                        <MetaItem icon="clock">{EXPERIENCE_LABELS[job.experience]}</MetaItem>
                        <MetaItem icon="badge">{LEVEL_LABELS[job.position_level]}</MetaItem>
                        <MetaItem icon="users">{job.quantity > 1 ? `${job.quantity} người` : ''}</MetaItem>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.Skills?.slice(0, 5).map((s) => <SkillTag key={s.id} name={s.name} />)}
                        {job.Skills?.length > 5 && <span className="text-xs text-slate-400 self-center">+{job.Skills.length - 5}</span>}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <WorkTypeBadge type={job.work_type} />
                          <DeadlineChip deadline={job.deadline} />
                        </div>
                        <div className="flex items-center gap-3">
                          {job.posted_at && <span className="text-xs text-slate-400">Đăng {timeAgo(job.posted_at)}</span>}
                          <SaveJobButton type="job" id={job.id} className="!w-8 !h-8" />
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
                  <button key={p} onClick={() => setFilters({ ...filters, page: p })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${
                      p === filters.page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Khung xem nhanh chi tiết (màn hình rộng) */}
          {selectedJob && (
            <div className="hidden lg:block flex-1 min-w-0 sticky top-24 self-start animate-fade-in">
              <div className="card border border-primary-200 shadow-xl bg-white max-h-[calc(100vh-7.5rem)] overflow-y-auto">
                <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-gray-100">
                  <Link to={`/jobs/${selectedJob.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline">
                    <Icon name="external" className="w-4 h-4" />Mở trang chi tiết
                  </Link>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Đóng khung chi tiết"
                    aria-label="Đóng"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>
                <JobDetailView compact job={selectedJob} action={applyButton(selectedJob)} />
              </div>
            </div>
          )}
        </div>
      )}

        </div>
      </div>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Ứng tuyển công việc</h2>
            <p className="text-sm font-medium text-primary-700 mb-1">{selectedJobForApply.title}</p>
            <p className="text-xs text-gray-500 mb-4"><Icon name="building" className="w-3.5 h-3.5 mr-1" />Doanh nghiệp: {selectedJobForApply.Company?.name}</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <CvSelector
                profile={profile}
                value={applyForm.cv_url}
                onChange={(url) => setApplyForm({ ...applyForm, cv_url: url })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thư giới thiệu (Cover Letter)
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Giới thiệu năng lực, kinh nghiệm thực chiến..."
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                />
              </div>

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
