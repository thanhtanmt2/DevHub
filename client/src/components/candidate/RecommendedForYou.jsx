import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import JobCard, { JobCardSkeleton } from '@/components/home/JobCard';
import useRecommendedJobs from '@/components/home/useRecommendedJobs';

// Mục "Việc làm phù hợp với bạn" ở dashboard ứng viên: các tin gần nhất với vị trí đã làm và kỹ năng của hồ sơ (cùng thuật toán với trang chủ)
export default function RecommendedForYou() {
  const { data, isLoading } = useRecommendedJobs('all', 6);
  const matched = (data?.data || []).filter((j) => j.match).slice(0, 3);

  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon name="sparkles" className="w-5 h-5 text-primary-700" />Việc làm phù hợp với bạn
        </h2>
        <Link to="/jobs" className="text-sm font-semibold text-primary-700 hover:underline">Xem tất cả việc làm →</Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <JobCardSkeleton key={i} />)}</div>
      ) : matched.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matched.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-5 text-sm text-primary-800">
          Chưa có tin nào đủ phù hợp với hồ sơ của bạn.{' '}
          <Link to="/candidate/profile" className="font-semibold underline">Bổ sung kỹ năng, kinh nghiệm và dự án</Link> để DevHub đề xuất việc làm phù hợp.
        </div>
      )}
    </section>
  );
}
