import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ManageUsersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers() });
  
  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUserStatus(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Đã cập nhật trạng thái user'); }
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
                  <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => toggleMutation.mutate(u.id)} className="text-primary-600 hover:underline">
                    {u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
