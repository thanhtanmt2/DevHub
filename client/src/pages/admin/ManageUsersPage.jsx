import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers() });
  
  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUserStatus(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Đã cập nhật trạng thái user'); },
    onError: (err) => { toast.error(err?.response?.data?.message || 'Có lỗi xảy ra'); }
  });

  if (isLoading) return <LoadingSpinner />;
  const users = data?.data?.data || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý Người dùng ({users.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{u.full_name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {u.Roles?.map(r => <span key={r.name} className="badge bg-gray-100 text-xs">{r.name}</span>)}
                  </div>
                </td>
                <td className="p-3">
                  {u.status === 'ACTIVE' && (
                    <span className="badge bg-green-100 text-green-700">Hoạt động</span>
                  )}
                  {u.status === 'LOCKED' && (
                    <span className="badge bg-red-100 text-red-700">Bị khóa</span>
                  )}
                  {(!u.status || u.status === 'INACTIVE') && (
                    <span className="badge bg-yellow-100 text-yellow-700">Chưa kích hoạt</span>
                  )}
                </td>
                <td className="p-3">
                  {u.id === currentUser?.id ? (
                    <span className="text-xs text-gray-400 italic">Tài khoản của bạn</span>
                  ) : (
                    <button
                      disabled={toggleMutation.isPending}
                      onClick={() => toggleMutation.mutate(u.id)}
                      className={u.status === 'LOCKED' ? 'text-green-600 hover:underline' : 'text-red-600 hover:underline'}
                    >
                      {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
