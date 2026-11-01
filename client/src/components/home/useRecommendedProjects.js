import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { homeApi } from '@/api/homeApi';

// Dự án thời vụ đề xuất (trang chủ, dashboard ứng viên). Khóa truy vấn gắn với người dùng; chờ AuthContext xác định phiên xong
// mới gọi để ứng viên không bị coi nhầm là khách.
export default function useRecommendedProjects(limit = 3) {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ['home-recommended-projects', user?.id ?? 'guest', limit],
    queryFn: () => homeApi.getRecommendedProjects({ limit }).then((res) => res.data),
    enabled: !loading,
    staleTime: 60 * 1000,
  });
}
