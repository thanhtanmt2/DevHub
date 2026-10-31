import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { homeApi } from '@/api/homeApi';

// Việc làm đề xuất cho trang chủ.
// - Khóa truy vấn gắn với người dùng hiện tại để không dùng nhầm kết quả đã lưu của người khác.
// - Chờ AuthContext xác định xong phiên đăng nhập: gọi quá sớm thì token cũ bị coi như khách, ứng viên mất đề xuất cá nhân.
export default function useRecommendedJobs(category = 'all', limit = 6) {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ['home-recommended', user?.id ?? 'guest', category, limit],
    queryFn: () => homeApi
      .getRecommendedJobs({ limit, ...(category !== 'all' ? { category } : {}) })
      .then((res) => res.data),
    enabled: !loading,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
