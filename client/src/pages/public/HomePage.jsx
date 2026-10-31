import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { homeApi } from '@/api/homeApi';
import Hero from '@/components/home/Hero';
import CompanyMarquee from '@/components/home/CompanyMarquee';
import RecommendedJobs from '@/components/home/RecommendedJobs';
import ProjectShowcase from '@/components/home/ProjectShowcase';
import HowItWorks from '@/components/home/HowItWorks';
import CtaBanner from '@/components/home/CtaBanner';

export default function HomePage() {
  const { user } = useAuth();
  const { data: overviewRes, isLoading } = useQuery({
    queryKey: ['home-overview'],
    queryFn: homeApi.getOverview,
    staleTime: 60 * 1000, // đủ ngắn để số liệu cập nhật sau khi vừa đăng tin / duyệt tin rồi quay lại trang chủ
  });
  const overview = overviewRes?.data?.data;

  return (
    // overflow-x-clip: nền động ở hero / các thẻ nổi không làm trang bị tràn ngang trên màn hình hẹp
    <div className={`overflow-x-clip ${user ? 'pb-20 lg:pb-24' : ''}`}>
      <Hero overview={overview} />
      <CompanyMarquee companies={overview?.companies} loading={isLoading} />
      <RecommendedJobs categories={overview?.categories} totalJobs={overview?.stats?.open_jobs} />
      <ProjectShowcase count={overview?.stats?.project_jobs} />
      <HowItWorks />
      {!user && <CtaBanner companies={overview?.companies} total={overview?.stats?.companies} />}
    </div>
  );
}
