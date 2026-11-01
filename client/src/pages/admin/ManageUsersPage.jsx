import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import Avatar from '@/components/common/Avatar';

const ROLE_LABELS = { CANDIDATE: 'Ứng viên', EMPLOYER: 'Nhà tuyển dụng', ADMIN: 'Quản trị viên' };
const ROLE_COLORS = { CANDIDATE: 'bg-primary-100 text-primary-700', EMPLOYER: 'bg-sky-100 text-sky-700', ADMIN: 'bg-red-100 text-red-700' };

export default function ManageUsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [assigningRole, setAssigningRole] = useState(null); // { userId, currentRole }

  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers() });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminApi.toggleUserStatus(id),
    onSuccess: (_, id) => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Đã cập nhật trạng thái tài khoản'); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => adminApi.activateUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Đã kích hoạt tài khoản thành công'); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const assignRoleMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.assignRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Đã phân quyền thành công'); setAssigningRole(null); },
    onError: (err) => toast.error(err?.response?.data?.message || 'Có lỗi xảy ra'),
  });

  if (isLoading) return <LoadingSpinner />;

  const allUsers = data?.data?.data || [];
  const users = allUsers.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.Roles?.some(r => r.name === roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="mb-5">
        <PageBanner compact icon="users" title={`Quản lý người dùng (${allUsers.length})`} subtitle="Phân quyền, khóa/mở khóa và kích hoạt tài khoản" />
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field flex-1 max-w-sm"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-44">
          <option value="">Tất cả vai trò</option>
          <option value="CANDIDATE">Ứng viên</option>
          <option value="EMPLOYER">Nhà tuyển dụng</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-slate-50 to-primary-50/60 border-b text-slate-500 uppercase text-xs">
            <tr>
              <th className="p-3">Họ tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">Vai trò</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Không tìm thấy người dùng nào.</td></tr>
            )}
            {users.map(u => {
              const isSelf = u.id === currentUser?.id;
              const userRole = u.Roles?.[0]?.name || '';
              return (
                <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium">
                    <span className="inline-flex items-center gap-2.5"><Avatar name={u.full_name} size="sm" />{u.full_name}</span>
                  </td>
                  <td className="p-3 text-gray-500">{u.email}</td>

                  {/* Vai trò + Phân quyền */}
                  <td className="p-3">
                    {assigningRole?.userId === u.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={userRole}
                          onChange={e => assignRoleMutation.mutate({ id: u.id, role: e.target.value })}
                          className="input-field w-auto !py-1 text-xs"
                          disabled={assignRoleMutation.isPending}
                        >
                          <option value="CANDIDATE">Ứng viên</option>
                          <option value="EMPLOYER">Nhà tuyển dụng</option>
                          <option value="ADMIN">Quản trị viên</option>
                        </select>
                        <button onClick={() => setAssigningRole(null)} className="text-gray-400 hover:text-gray-600" aria-label="Hủy"><Icon name="x" className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {u.Roles?.map(r => (
                          <span key={r.name} className={`badge text-xs ${ROLE_COLORS[r.name] || 'bg-gray-100'}`}>
                            {ROLE_LABELS[r.name] || r.name}
                          </span>
                        ))}
                        {!isSelf && (
                          <button
                            onClick={() => setAssigningRole({ userId: u.id })}
                            className="text-xs text-gray-400 hover:text-primary-700 transition-colors"
                            title="Đổi vai trò"
                          ><Icon name="pencil" className="w-4 h-4" /></button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="p-3">
                    {u.status === 'ACTIVE' && <span className="badge bg-green-100 text-green-700">Hoạt động</span>}
                    {u.status === 'LOCKED' && <span className="badge bg-red-100 text-red-700">Bị khóa</span>}
                    {(!u.status || u.status === 'INACTIVE') && <span className="badge bg-yellow-100 text-yellow-700">Chưa kích hoạt</span>}
                  </td>

                  {/* Hành động */}
                  <td className="p-3 text-center">
                    {isSelf ? (
                      <span className="text-xs text-gray-400 italic">Tài khoản của bạn</span>
                    ) : u.status === 'INACTIVE' ? (
                      <button
                        disabled={activateMutation.isPending}
                        onClick={() => activateMutation.mutate(u.id)}
                        className="text-xs text-primary-700 hover:underline font-medium"
                      >
                        Kích hoạt
                      </button>
                    ) : (
                      <button
                        disabled={toggleMutation.isPending}
                        onClick={() => toggleMutation.mutate(u.id)}
                        className={`text-xs font-medium hover:underline ${u.status === 'LOCKED' ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {u.status === 'LOCKED' ? 'Mở khóa' : 'Khóa tài khoản'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
