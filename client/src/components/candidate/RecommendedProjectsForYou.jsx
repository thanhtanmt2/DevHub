import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import ProjectCard from '@/components/home/ProjectCard';
import { JobCardSkeleton } from '@/components/home/JobCard';
import useRecommendedProjects from '@/components/home/useRecommendedProjects';

// Mục "Dự án thời vụ phù hợp với bạn" ở dashboard ứng viên: các vị trí gần với vị trí đã làm và kỹ năng của hồ sơ (cùng cách chấm với việc làm)
export default function RecommendedProjectsForYou() {
  const { data, isLoading } = useRecommendedProjects(6);
  const matched = (data?.data || []).filter((j) => j.match).slice(0, 3);

  return (
    <section className="card">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon name="sparkles" className="w-5 h-5 text-primary-700" />Dự án thời vụ phù hợp với bạn
        </h2>
        <Link to="/projects" className="text-sm font-semibold text-primary-700 hover:underline">Xem tất cả dự án →</Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <JobCardSkeleton key={i} />)}</div>
      ) : matched.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matched.map((job) => <ProjectCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-4 py-5 text-sm text-primary-800">
          Chưa có dự án nào đủ phù hợp với hồ sơ của bạn.{' '}
          <Link to="/candidate/profile" className="font-semibold underline">Bổ sung kỹ năng, kinh nghiệm và dự án</Link> để DevHub đề xuất dự án thời vụ phù hợp.
        </div>
      )}
    </section>
  );
}
