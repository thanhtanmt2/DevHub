import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/api/companyApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SafeImage from '@/components/common/SafeImage';
import Icon, { IconBadge } from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import PageBanner from '@/components/common/PageBanner';
import Avatar from '@/components/common/Avatar';
import { SkillTag } from '@/components/common/Badges';

const LEVEL_LABELS = { BEGINNER: 'Mới', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Cao cấp', EXPERT: 'Chuyên gia' };
const LEVEL_COLORS = {
  BEGINNER: 'bg-gray-100 text-gray-600',
  INTERMEDIATE: 'bg-blue-100 text-blue-700',
  ADVANCED: 'bg-sky-100 text-sky-700',
  EXPERT: 'bg-amber-100 text-amber-700',
};

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

function CandidateDetailModal({ profile, onClose }) {
  useEscapeKey(onClose);
  if (!profile) return null;
  const user = profile.User;
  const skills = profile.Skills || [];
  const experiences = profile.Experiences || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b">
          <div className="flex items-center gap-4">
            <Avatar name={user?.full_name} src={profile.avatar_url} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
              <p className="text-sm text-primary-600 font-medium">{profile.professional_title || 'Chưa cập nhật'}</p>
              {profile.address && <p className="text-xs text-gray-500 mt-0.5"><Icon name="mapPin" className="w-3.5 h-3.5 mr-1" />{profile.address}</p>}
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="text-gray-400 hover:text-gray-600"><Icon name="x" className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center">
              <ScoreBadge score={profile.competency_score} />
              <p className="text-xs text-primary-500 mt-1">Điểm năng lực</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{skills.length}</p>
              <p className="text-xs text-emerald-500 mt-1">Kỹ năng</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{experiences.length}</p>
              <p className="text-xs text-amber-500 mt-1">Kinh nghiệm</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {profile.cv_url && (
              <a href={profile.cv_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 transition-colors">
                <Icon name="document" className="w-4 h-4" />Xem CV
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Icon name="code" className="w-4 h-4" />GitHub
              </a>
            )}
            {profile.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Icon name="globe" className="w-4 h-4" />Portfolio
              </a>
            )}
          </div>

          {/* Giới thiệu */}
          {profile.introduction && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Giới thiệu</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {profile.introduction}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <div key={s.id} className="flex items-center gap-1.5">
                    <span className="badge bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1">
                      {s.name}
                    </span>
                    {s.CandidateSkill?.level && (
                      <span className={`badge text-xs px-2 py-0.5 ${LEVEL_COLORS[s.CandidateSkill.level]}`}>
                        {LEVEL_LABELS[s.CandidateSkill.level]}
                        {s.CandidateSkill.years_of_experience ? ` · ${s.CandidateSkill.years_of_experience}y` : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">Kinh nghiệm làm việc</h3>
              <div className="space-y-3">
                {experiences.map(exp => (
                  <div key={exp.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <p className="font-semibold text-gray-800 text-sm">{exp.job_title}</p>
                    <p className="text-xs text-primary-600 font-medium">{exp.company_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(exp.start_date).toLocaleDateString('vi-VN')} —{' '}
                      {exp.end_date ? new Date(exp.end_date).toLocaleDateString('vi-VN') : 'Hiện tại'}
                    </p>
                    {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchCandidatesPage() {
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({ keyword: '', skill_id: '', score_min: '', score_max: '', address: '', page: 1 });
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Debounce keyword
  useEffect(() => {
    const t = setTimeout(() => setFilters(p => ({ ...p, keyword, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [keyword]);

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

  const handleFilterChange = (key, value) => setFilters(p => ({ ...p, [key]: value, page: 1 }));

  return (
    <div className="space-y-6">
      <PageBanner compact icon="search" title="Tìm kiếm ứng viên" subtitle="Tìm ứng viên phù hợp dựa trên kỹ năng, điểm năng lực và kinh nghiệm">
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
            onChange={e => handleFilterChange('skill_id', e.target.value)}
          >
            <option value="">-- Tất cả kỹ năng --</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input
            className="input-field md:w-40"
            placeholder="Địa điểm"
            value={filters.address}
            onChange={e => handleFilterChange('address', e.target.value)}
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
              onChange={e => handleFilterChange('score_min', e.target.value)}
            />
            <span className="text-gray-400">—</span>
            <input
              type="number" min="0" max="10" step="0.5"
              className="input-field w-20 text-center text-sm"
              placeholder="Đến"
              value={filters.score_max}
              onChange={e => handleFilterChange('score_max', e.target.value)}
            />
          </div>
          {(filters.skill_id || filters.address || filters.score_min || filters.score_max || keyword) && (
            <button
              onClick={() => { setKeyword(''); setFilters({ keyword: '', skill_id: '', score_min: '', score_max: '', address: '', page: 1 }); }}
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
              const skills = profile.Skills || [];
              const score = parseFloat(profile.competency_score) || 0;
              const scoreColor = score >= 8 ? 'border-emerald-200 bg-emerald-50' : score >= 5 ? 'border-amber-100 bg-amber-50/50' : 'border-gray-100';

              return (
                <div key={profile.id}
                  className={`card border-2 hover:shadow-lg transition-all cursor-pointer ${scoreColor}`}
                  onClick={() => setSelectedProfile(profile)}
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
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map(s => <SkillTag key={s.id} name={s.name} />)}
                      {skills.length > 4 && (
                        <span className="badge bg-gray-50 text-gray-400 border border-gray-100 text-xs px-2 py-0.5">
                          +{skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-3">
                    <span className="text-xs text-primary-600 font-medium hover:underline">Xem hồ sơ →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page === 1}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                ← Trước
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - filters.page) <= 2)
                .map(p => (
                  <button key={p}
                    onClick={() => setFilters(f => ({ ...f, page: p }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${p === filters.page ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page === pagination.totalPages}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedProfile && (
        <CandidateDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
