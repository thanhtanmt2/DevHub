import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { companyApi } from '@/api/companyApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import Avatar from '@/components/common/Avatar';
import { SkillTag, VerifiedSkillTag } from '@/components/common/Badges';

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

const FILTER_KEYS = ['keyword', 'skill_id', 'score_min', 'score_max', 'address'];

export default function SearchCandidatesPage() {
  const navigate = useNavigate();
  // Bộ lọc nằm trên đường dẫn: xem hồ sơ xong bấm "Quay lại" vẫn còn nguyên kết quả đang tìm
  const [params, setParams] = useSearchParams();
  const filters = {
    ...Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ''])),
    page: parseInt(params.get('page')) || 1,
  };
  const [keyword, setKeyword] = useState(filters.keyword);

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

  const candidates = data?.data?.data || [];
  const pagination = data?.data?.pagination;
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
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Điểm năng lực:</span>
          <div className="flex items-center gap-2">
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
          {hasFilter && (
            <button
              onClick={() => { setKeyword(''); setParams({}, { replace: true }); }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Xóa bộ lọc
            </button>
          )}
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
                      <p className="text-xs text-primary-600 truncate">{profile.professional_title || 'Chưa cập nhật'}</p>
                      {profile.address && <p className="text-xs text-gray-400 mt-0.5 truncate"><Icon name="mapPin" className="w-3.5 h-3.5 mr-1" />{profile.address}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <ScoreBadge score={profile.competency_score} />
                    </div>
                  </div>

                  {profile.introduction && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">{profile.introduction}</p>
                  )}

                  {/* Skills */}
                  {cardSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {cardSkills.slice(0, 4).map(s => <VerifiedSkillTag key={s.id} name={s.name} evidence={s.evidence} />)}
                      {cardSkills.length > 4 && (
                        <span className="badge bg-gray-50 text-gray-400 border border-gray-100 text-xs px-2 py-0.5">
                          +{cardSkills.length - 4}
                        </span>
                      )}
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
                      ) : (
                        <span className="text-gray-400">Chưa có dự án trên DevHub</span>
                      )}
                    </div>
                    <span className="text-xs text-primary-600 font-medium whitespace-nowrap">Xem hồ sơ →</span>
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
    </div>
  );
}
