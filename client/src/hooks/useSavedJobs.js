import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { candidateApi } from '@/api/candidateApi';

// Việc làm đã lưu (yêu thích) của ứng viên đang đăng nhập.
// type: 'job' (tin tuyển dụng) | 'project' (vị trí dự án thời vụ). Chỉ tải danh sách id đã lưu; danh sách đầy đủ nằm ở trang "Việc làm đã lưu".
export default function useSavedJobs() {
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();
  const candidate = !!user && isCandidate();
  const key = ['saved-ids', user?.id];

  const { data } = useQuery({
    queryKey: key,
    queryFn: async () => (await candidateApi.getSavedIds()).data.data,
    enabled: candidate,
    staleTime: 60 * 1000,
  });
  const ids = { job: data?.jobs || [], project: data?.projects || [] };
  const isSaved = (type, id) => ids[type]?.includes(id) || false;

  const mutation = useMutation({
    mutationFn: ({ type, id, save }) => (save ? candidateApi.saveJob(type, id) : candidateApi.unsaveJob(type, id)),
    // Tô sáng trái tim ngay, lỗi thì trả về như cũ
    onMutate: async ({ type, id, save }) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData(key);
      const field = type === 'job' ? 'jobs' : 'projects';
      qc.setQueryData(key, (old) => {
        const cur = old || { jobs: [], projects: [] };
        const list = cur[field].filter((x) => x !== id);
        return { ...cur, [field]: save ? [...list, id] : list };
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      qc.setQueryData(key, ctx?.prev);
      toast.error(err.response?.data?.message || 'Chưa thực hiện được, vui lòng thử lại');
    },
    onSuccess: (_res, { save }) => toast.success(save ? 'Đã lưu tin vào mục Việc làm đã lưu' : 'Đã bỏ lưu tin'),
    onSettled: () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ['saved-jobs'] }); },
  });

  // Khách bấm trái tim → mời đăng nhập; nhà tuyển dụng / admin không có tính năng này
  const toggle = (type, id) => {
    if (!user) { toast('Đăng nhập tài khoản ứng viên để lưu tin'); openLoginModal(); return; }
    if (!candidate) { toast.error('Chỉ tài khoản ứng viên mới lưu được tin'); return; }
    mutation.mutate({ type, id, save: !isSaved(type, id) });
  };

  return { candidate, isSaved, toggle, count: ids.job.length + ids.project.length };
}
