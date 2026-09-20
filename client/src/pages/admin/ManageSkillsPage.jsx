import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ManageSkillsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: () => skillApi.getAllSkills(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => skillApi.createSkill(data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-skills']);
      qc.invalidateQueries(['public-skills']);
      setShowAdd(false);
      setForm({ name: '', description: '' });
      toast.success('Đã thêm kỹ năng!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Thêm thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => skillApi.deleteSkill(id),
    onSuccess: () => { qc.invalidateQueries(['admin-skills']); toast.success('Đã vô hiệu hóa kỹ năng'); },
  });

  const skills = data?.data?.data || [];
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Danh mục kỹ năng ({skills.length})</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">+ Thêm kỹ năng</button>
      </div>

      {showAdd && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên kỹ năng</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="React, Python, Docker..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
              <input className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Mô tả ngắn..." />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="btn-primary text-sm">
              {createMutation.isPending ? 'Đang thêm...' : 'Thêm kỹ năng'}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Tên kỹ năng</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Mô tả</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Trạng thái</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => (
                <tr key={skill.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{skill.name}</td>
                  <td className="py-3 px-2 text-gray-500">{skill.description || '—'}</td>
                  <td className="py-3 px-2">
                    <span className={`badge ${skill.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {skill.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    {skill.status === 'ACTIVE' && (
                      <button onClick={() => deleteMutation.mutate(skill.id)} className="text-xs text-red-500 hover:underline">Vô hiệu hóa</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
