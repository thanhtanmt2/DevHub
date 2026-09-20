import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { workspaceApi } from '@/api/workspaceApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function InternalProjectsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', budget: '', expected_end_date: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => workspaceApi.getProjects(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => workspaceApi.createProject({ ...data, budget: parseFloat(data.budget) || 0 }),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-projects']); 
      setShowAdd(false); 
      setForm({ name: '', description: '', budget: '', expected_end_date: '' }); 
      toast.success('Đã tạo dự án & workspace!'); 
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Thất bại'),
  });

  const projects = data?.data?.data || [];
  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý Dự án Nội bộ</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">+ Tạo Dự án</button>
      </div>

      {showAdd && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">Tạo Dự án Mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngân sách dự kiến (VNĐ)</label>
              <input type="number" className="input-field" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc dự kiến</label>
              <input type="date" className="input-field" value={form.expected_end_date} onChange={e => setForm({...form, expected_end_date: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="btn-primary">Tạo dự án</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Hủy</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 && <p className="text-gray-500">Chưa có dự án nào.</p>}
        {projects.map(project => (
          <div key={project.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{project.name}</h3>
              <span className={`badge ${project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="text-xs text-gray-500">
                <p>Tiến độ: {project.completion_rate}%</p>
              </div>
              {project.Workspace && (
                <Link to={`/admin/workspaces/${project.Workspace.id}`} className="btn-primary text-sm py-1 px-3">
                  Vào Workspace →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
