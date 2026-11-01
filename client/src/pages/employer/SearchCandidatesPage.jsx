import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { companyApi } from '@/api/companyApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import Avatar from '@/components/common/Avatar';
import { SkillTag, VerifiedSkillTag } from '@/components/common/Badges';
import { formatDate } from '@/utils/jobMeta';

function ScoreBadge({ score }) {
  const s = parseFloat(score);
  // competency_score là DECIMAL (API trả chuỗi "0.00"): rỗng hoặc 0 nghĩa là chưa được đánh giá, không hiện "0.0/10" màu đỏ
  if (!s) return <span className="text-gray-400 text-xs">Chưa đánh giá</span>;
  const color = s >= 8 ? 'text-emerald-600' : s >= 5 ? 'text-amber-600' : 'text-red-500';
  return (
    <span className={`font-bold text-lg ${color}`}>
      {s.toFixed(1)}
      <span className="text-xs font-normal text-gray-400">/10</span>
    </span>
  );
}

function projectScoreBadgeClass(score) {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return 'bg-gray-100 text-gray-500 border-gray-200';
  }
  if (score >= 8) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 5) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-600 border-red-200';
}

function ProjectEvaluationsModal({ candidate, onClose, onViewProfile }) {
  if (!candidate) return null;
  const evals = candidate.project_evaluations || [];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate">
              Đánh giá từng dự án — {candidate.User?.full_name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Điểm đánh giá và nhận xét thực tế từ quản lý dự án trên DevHub ({evals.length} dự án)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {evals.map((ev) => {
            const hasScore = ev.score !== null && ev.score !== undefined;
            return (
              <div
                key={ev.member_id}
                className="rounded-xl border border-gray-200 p-3.5 bg-gray-50/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 break-words">
                      {ev.project_name}
                    </p>
                    <p className="text-xs text-primary-700 font-medium mt-0.5">
                      {ev.position || 'Thành viên dự án'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${projectScoreBadgeClass(ev.score)}`}
                  >
                    {hasScore ? (
                      <>
                        <Icon name="star" className="w-3.5 h-3.5" />
                        {Number(ev.score).toFixed(1)}/10
                      </>
                    ) : (
                      'Chưa chấm điểm'
                    )}
                  </span>
                </div>

                {ev.comment ? (
                  <p className="text-xs text-gray-700 italic bg-white border border-gray-100 rounded-lg p-2.5 whitespace-pre-line">
                    “{ev.comment}”
                  </p>
                ) : hasScore ? (
                  <p className="text-xs text-gray-400">Không có nhận xét chi tiết kèm theo.</p>
                ) : null}

                {ev.evaluated_at && (
                  <p className="text-[11px] text-gray-400">
                    Đánh giá ngày {formatDate(ev.evaluated_at)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewProfile(candidate);
            }}
            className="btn-primary text-sm"
          >
            Xem toàn bộ hồ sơ →
          </button>
        </div>
      </div>
    </div>
  );
}

const FILTER_KEYS = ['keyword', 'skill_id', 'score_min', 'score_max', 'project_min', 'project_max', 'saved_only', 'address'];

export default function SearchCandidatesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  // Bộ lọc nằm trên đường dẫn: xem hồ sơ xong bấm "Quay lại" vẫn còn nguyên kết quả đang tìm
  const [params, setParams] = useSearchParams();
  const filters = {
    ...Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])),
    page: parseInt(params.get('page')) || 1,
  };
  const [keyword, setKeyword] = useState(filters.keyword);
  const [evalModalCandidate, setEvalModalCandidate] = useState(null);

  const setFilter = (patch, { keepPage = false } = {}) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => (v === '' || v === null || v === undefined ? next.delete(k) : next.set(k, v)));
      if (!keepPage) next.delete('page');
      return next;
    }, { replace: true });
  };

  // Debounce từ khóa: chờ 400ms sau khi ngừng gõ mới tìm
  useEffect(() => {
    if (keyword === filters.keyword) return undefined;
    const t = setTimeout(() => setFilter({ keyword }), 400);
    return () => clearTimeout(t);
  }, [keyword]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employer-search-candidates', filters],
    queryFn: () => companyApi.searchCandidates(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== null))
    ),
    keepPreviousData: true,
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const saveMutation = useMutation({
    mutationFn: (candidateId) => companyApi.toggleSaveCandidate(candidateId),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã cập nhật danh sách lưu');
      qc.invalidateQueries({ queryKey: ['employer-search-candidates'] });
      qc.invalidateQueries({ queryKey: ['employer-candidate'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể lưu ứng viên');
    },
  });

  const candidates = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const savedCount = pagination?.saved_count ?? 0;
  const isSavedOnly = filters.saved_only === '1' || filters.saved_only === 'true';
  const skills = skillsRes?.data?.data || [];
  const hasFilter = FILTER_KEYS.some((k) => filters[k]) || keyword;

  const open = (profile) => navigate(`/employer/candidates/${profile.id}`);

  return (
    <div className="space-y-6">
      <PageBanner compact icon="search" title="Tìm kiếm ứng viên" subtitle="Tìm ứng viên phù hợp dựa trên kỹ năng, điểm năng lực và các dự án đã làm trên DevHub">
        {pagination && (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-sm font-medium">
            Tìm thấy <strong className="mx-1">{pagination.total}</strong> ứng viên
          </span>
        )}
      </PageBanner>

      {/* Filters */}
      <div className="card space-y-3">
        {/* Tab chuyển nhanh: Tất cả ứng viên / Ứng viên đã lưu */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter({ saved_only: '' })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isSavedOnly
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả ứng viên
            </button>
            <button
              type="button"
              onClick={() => setFilter({ saved_only: isSavedOnly ? '' : '1' })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSavedOnly
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Icon name="bookmark" className="w-3.5 h-3.5" />
              Ứng viên đã lưu ({savedCount})
            </button>
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={() => { setKeyword(''); setParams({}, { replace: true }); }}
              className="text-xs text-red-500 hover:text-red-700 underline font-medium"
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Tìm theo tên, chức danh, giới thiệu..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <select
            className="input-field md:w-52"
            value={filters.skill_id}
            onChange={e => setFilter({ skill_id: e.target.value })}
          >
            <option value="">-- Tất cả kỹ năng --</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input
            className="input-field md:w-40"
            placeholder="Địa điểm"
            value={filters.address}
            onChange={e => setFilter({ address: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-x-6 gap-y-3 flex-wrap pt-1">
          {/* Lọc theo Điểm năng lực */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Điểm năng lực:</span>
            <input
              type="number" min="0" max="10" step="0.5"
              className="input-field w-20 text-center text-sm"
              placeholder="Từ"
              value={filters.score_min}
              onChange={e => setFilter({ score_min: e.target.value })}
            />
            <span className="text-gray-400">—</span>
            <input
              type="number" min="0" max="10" step="0.5"
              className="input-field w-20 text-center text-sm"
              placeholder="Đến"
              value={filters.score_max}
              onChange={e => setFilter({ score_max: e.target.value })}
            />
          </div>

          {/* Lọc theo Số dự án đã tham gia */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Số dự án DevHub:</span>
            <input
              type="number" min="0" step="1"
              className="input-field w-20 text-center text-sm"
              placeholder="Từ"
              value={filters.project_min}
              onChange={e => setFilter({ project_min: e.target.value })}
            />
            <span className="text-gray-400">—</span>
            <input
              type="number" min="0" step="1"
              className="input-field w-20 text-center text-sm"
              placeholder="Đến"
              value={filters.project_max}
              onChange={e => setFilter({ project_max: e.target.value })}
            />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 5].map((n) => {
                const active = String(filters.project_min) === String(n) && !filters.project_max;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFilter({ project_min: active ? '' : String(n), project_max: '' })}
                    className={`px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ≥ {n} dự án
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="card text-center py-10 text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>
      ) : candidates.length === 0 ? (
        <div className="card text-center py-16">
          <IconBadge name="search" size="lg" className="mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Không tìm thấy ứng viên phù hợp</p>
          <p className="text-xs text-gray-400 mt-1">Thử thay đổi bộ lọc để tìm thêm ứng viên</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidates.map(profile => {
              const user = profile.User;
              const cardSkills = profile.Skills || [];
              const score = parseFloat(profile.competency_score) || 0;
              const projects = Number(profile.project_count) || 0;
              const doneTasks = Number(profile.done_task_count) || 0;
              const projectEvals = profile.project_evaluations || [];
              const scoreColor = score >= 8 ? 'border-emerald-200 bg-emerald-50' : score >= 5 ? 'border-amber-100 bg-amber-50/50' : 'border-gray-100';

              return (
                <div key={profile.id}
                  role="link"
                  tabIndex={0}
                  className={`card border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col ${scoreColor}`}
                  onClick={() => open(profile)}
                  onKeyDown={(e) => { if (e.key === 'Enter') open(profile); }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={user?.full_name} src={profile.avatar_url} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 break-words">{user?.full_name}</h3>
                      <p className="text-xs text-primary-700 truncate">{profile.professional_title || 'Chưa cập nhật'}</p>
                      {profile.address && <p className="text-xs text-gray-400 mt-0.5 truncate"><Icon name="mapPin" className="w-3.5 h-3.5 mr-1" />{profile.address}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        title={profile.is_saved ? 'Bỏ lưu ứng viên' : 'Lưu ứng viên'}
                        onClick={(e) => {
                          e.stopPropagation();
                          saveMutation.mutate(profile.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          profile.is_saved
                            ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                            : 'bg-white/90 text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-700'
                        }`}
                      >
                        <Icon name="bookmark" className="w-3.5 h-3.5" />
                        {profile.is_saved ? 'Đã lưu' : 'Lưu'}
                      </button>
                      <ScoreBadge score={profile.competency_score} />
                    </div>
                  </div>

                  {profile.introduction && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">{profile.introduction}</p>
                  )}

                  {/* Skills */}
                  {cardSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cardSkills.slice(0, 4).map(s => <VerifiedSkillTag key={s.id} name={s.name} evidence={s.evidence} />)}
                      {cardSkills.length > 4 && (
                        <span className="badge bg-gray-50 text-gray-400 border border-gray-100 text-xs px-2 py-0.5">
                          +{cardSkills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Điểm đánh giá từng dự án trên DevHub */}
                  {projectEvals.length > 0 && (
                    <div
                      className="mt-1 mb-2 rounded-xl bg-white/80 border border-gray-200/80 p-2.5 space-y-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEvalModalCandidate(profile);
                      }}
                      title="Bấm để xem chi tiết điểm và nhận xét từng dự án"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                        <span>Điểm đánh giá từng dự án ({projectEvals.length})</span>
                        <span className="text-primary-600 hover:underline">Chi tiết</span>
                      </div>
                      <div className="space-y-1">
                        {projectEvals.slice(0, 2).map((ev) => (
                          <div
                            key={ev.member_id}
                            className="flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="text-gray-700 truncate font-medium">
                              • {ev.project_name}
                            </span>
                            <span
                              className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[11px] font-bold ${projectScoreBadgeClass(ev.score)}`}
                            >
                              {ev.score !== null && ev.score !== undefined
                                ? `★ ${Number(ev.score).toFixed(1)}/10`
                                : 'Chưa chấm'}
                            </span>
                          </div>
                        ))}
                        {projectEvals.length > 2 && (
                          <p className="text-[11px] text-primary-600 font-medium">
                            +{projectEvals.length - 2} dự án khác...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kinh nghiệm thực chiến trên DevHub */}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {projects > 0 ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium">
                            <Icon name="folder" className="w-3.5 h-3.5" />{projects} dự án
                          </span>
                          {doneTasks > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                              <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />{doneTasks} task hoàn thành
                            </span>
                          )}
                        </>
                      ) : profile.devhub_projects_hidden ? (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Icon name="lock" className="w-3.5 h-3.5" />Đã ẩn dự án
                        </span>
                      ) : (
                        <span className="text-gray-400">Chưa có dự án trên DevHub</span>
                      )}
                    </div>
                    <span className="text-xs text-primary-700 font-medium whitespace-nowrap">Xem hồ sơ →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setFilter({ page: filters.page - 1 }, { keepPage: true })}
                disabled={filters.page === 1}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ← Trước
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - filters.page) <= 2)
                .map(p => (
                  <button key={p}
                    onClick={() => setFilter({ page: p }, { keepPage: true })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${p === filters.page ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setFilter({ page: filters.page + 1 }, { keepPage: true })}
                disabled={filters.page === pagination.totalPages}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      <ProjectEvaluationsModal
        candidate={evalModalCandidate}
        onClose={() => setEvalModalCandidate(null)}
        onViewProfile={(cand) => open(cand)}
      />
    </div>
  );
}
