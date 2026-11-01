import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon, { IconBadge } from '@/components/common/Icon';
import Reveal from '@/components/home/Reveal';
import SectionHeader from '@/components/home/SectionHeader';
import JobCard, { JobCardSkeleton } from '@/components/home/JobCard';
import useRecommendedJobs from '@/components/home/useRecommendedJobs';

const linkCls = 'font-semibold text-primary-700 hover:text-primary-800 hover:underline';

// Việc làm đề xuất: ứng viên đã có kỹ năng → xếp theo mức phù hợp với hồ sơ; còn lại → tin nổi bật. Lọc nhanh theo lĩnh vực.
export default function RecommendedJobs({ categories = [], totalJobs = 0 }) {
  const { user, isCandidate, openLoginModal } = useAuth();
  const [cat, setCat] = useState('all');
  const { data, isLoading, isError, isPlaceholderData, refetch } = useRecommendedJobs(cat);

  const jobs = data?.data || [];
  const personalized = !!data?.personalized;
  const tabs = [{ key: 'all', label: 'Tất cả' }, ...categories.filter((c) => c.count > 0)];
  const candidate = !!user && isCandidate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
      <Reveal>
        <SectionHeader
          icon={personalized ? 'sparkles' : 'bolt'}
          eyebrow={personalized ? 'Đề xuất riêng cho bạn' : 'Cơ hội nổi bật'}
          title={personalized ? 'Việc làm dành cho bạn' : 'Việc làm được quan tâm nhiều'}
          subtitle={personalized ? 'Được xếp theo vị trí đã làm và kỹ năng trong hồ sơ của bạn.' : undefined}
          action={(
            <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 whitespace-nowrap group">
              Xem tất cả việc làm<Icon name="arrowRight" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        />
      </Reveal>

      {/* Lọc theo lĩnh vực (cuộn ngang trên điện thoại) */}
      <div className="mt-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto sm:flex-wrap no-scrollbar" role="tablist" aria-label="Lĩnh vực">
        {tabs.map((t) => {
          const active = cat === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCat(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                active
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/25'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Gợi ý để có đề xuất cá nhân hóa */}
      {!personalized && !isLoading && (!user || candidate) && (
        <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-slate-500">
          <Icon name="info" className="w-4 h-4 text-primary-500" />
          {!user ? (
            <>Đăng nhập bằng tài khoản ứng viên để nhận đề xuất theo kỹ năng của bạn.
              <button type="button" onClick={openLoginModal} className={linkCls}>Đăng nhập</button></>
          ) : (
            <>Chưa có tin nào đủ phù hợp với hồ sơ của bạn.
              <Link to="/candidate/profile" className={linkCls}>Hoàn thiện hồ sơ</Link> (kỹ năng, kinh nghiệm, dự án) để nhận đề xuất chính xác hơn.</>
          )}
        </p>
      )}

      <div className={`mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ${isPlaceholderData ? 'opacity-50' : ''}`}>
        {isLoading && Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)}
        {!isLoading && jobs.map((job, i) => (
          <Reveal key={job.id} delay={(i % 3) * 90} className={`h-full ${i >= 4 ? 'hidden sm:block' : ''}`}>
            <JobCard job={job} />
          </Reveal>
        ))}
      </div>

      {isError && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <IconBadge name="alert" tone="amber" size="lg" className="mx-auto" />
          <p className="mt-3 font-semibold text-slate-800">Không tải được danh sách việc làm</p>
          <button type="button" onClick={() => refetch()} className="btn-secondary mt-4">Thử lại</button>
        </div>
      )}
      {!isLoading && !isError && jobs.length === 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white py-12 text-center">
          <IconBadge name="search" tone="slate" size="lg" className="mx-auto" />
          <p className="mt-3 font-semibold text-slate-800">Chưa có việc làm trong lĩnh vực này</p>
          <button type="button" onClick={() => setCat('all')} className={`mt-2 text-sm ${linkCls}`}>Xem tất cả lĩnh vực</button>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="mt-8 text-center">
          <Link to="/jobs" className="btn-secondary px-6 py-2.5">
            Xem tất cả{totalJobs ? ` ${totalJobs}` : ''} việc làm<Icon name="arrowRight" className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
