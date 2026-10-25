import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { candidateApi } from '@/api/candidateApi';
import { useConfirm } from '@/components/common/ConfirmDialog';
import ExperienceTimeline, { EXP_TYPES } from '@/components/candidate/ExperienceTimeline';
import CvImportModal from '@/components/candidate/CvImportModal';

const FORM_TYPES = ['COMPANY', 'PROJECT', 'FREELANCE', 'PERSONAL'];
const EMPTY = { type: 'COMPANY', parent_id: '', job_title: '', company_name: '', start_date: '', end_date: '', description: '', tasksText: '', techText: '', link_url: '' };

const toLines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);
const toTags = (t) => [...new Set(t.split(',').map((x) => x.trim()).filter(Boolean))];

// Tab Kinh nghiệm: sơ đồ thời gian + form thêm / sửa. Dự án thật trên DevHub tự động hiện trên sơ đồ.
export default function ExperienceTab({ experiences, qc }) {
  const confirm = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: devhubRes } = useQuery({
    queryKey: ['candidate-devhub-projects'],
    queryFn: () => candidateApi.getDevhubProjects(),
  });
  const devhubProjects = devhubRes?.data?.data || [];
  const companies = experiences.filter((e) => (e.type || 'COMPANY') === 'COMPANY');

  const refresh = () => qc.invalidateQueries({ queryKey: ['candidate-experiences'] });
  const close = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

  const saveMutation = useMutation({
    mutationFn: (data) => (editId ? candidateApi.updateExperience(editId, data) : candidateApi.addExperience(data)),
    onSuccess: () => { refresh(); close(); toast.success(editId ? 'Đã cập nhật!' : 'Đã thêm kinh nghiệm!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Thất bại'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => candidateApi.deleteExperience(id),
    onSuccess: () => { refresh(); toast.success('Đã xóa'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Xóa thất bại'),
  });

  const openAdd = (preset = {}) => { setEditId(null); setForm({ ...EMPTY, ...preset }); setShowForm(true); };
  const startEdit = (e) => {
    setEditId(e.id);
    setForm({
      type: e.type || 'COMPANY', parent_id: e.parent_id || '', job_title: e.job_title, company_name: e.company_name,
      start_date: e.start_date || '', end_date: e.end_date || '', description: e.description || '',
      tasksText: (e.tasks || []).join('\n'), techText: (e.technologies || []).join(', '), link_url: e.link_url || '',
    });
    setShowForm(true);
  };
  const handleDelete = async (e) => {
    const kids = experiences.filter((x) => x.parent_id === e.id).length;
    const ok = await confirm({
      title: 'Xóa kinh nghiệm',
      message: kids ? `Xóa "${e.company_name}" sẽ xóa luôn ${kids} dự án bên trong. Bạn chắc chắn chứ?` : `Bạn có chắc muốn xóa "${e.company_name}"?`,
      confirmText: 'Xóa', tone: 'danger',
    });
    if (ok) deleteMutation.mutate(e.id);
  };

  const meta = EXP_TYPES[form.type];
  const isProject = form.type === 'PROJECT';
  const invalid = !form.job_title.trim() || !form.company_name.trim() || !form.start_date || (isProject && !form.parent_id)
    || (form.end_date && form.end_date < form.start_date);

  const submit = () => saveMutation.mutate({
    type: form.type,
    parent_id: isProject ? form.parent_id : null,
    job_title: form.job_title,
    company_name: form.company_name,
    start_date: form.start_date,
    end_date: form.end_date || null,
    description: form.description,
    tasks: toLines(form.tasksText),
    technologies: toTags(form.techText),
    link_url: form.link_url.trim() || null,
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Sơ đồ kinh nghiệm</h2>
          <p className="text-xs text-gray-500">Công ty, dự án, freelance và dự án cá nhân theo thời gian. Dự án trên DevHub tự động xuất hiện.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary text-sm">Nhập từ CV</button>
          <button onClick={() => (showForm ? close() : openAdd())} className="btn-primary text-sm">+ Thêm</button>
        </div>
      </div>
      {showImport && <CvImportModal mode="experience" onClose={() => setShowImport(false)} onDone={refresh} />}

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Loại kinh nghiệm">
            {FORM_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t, parent_id: t === 'PROJECT' ? form.parent_id : '' })} aria-pressed={form.type === t}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${form.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>
                {EXP_TYPES[t].label}
              </button>
            ))}
          </div>
          {isProject && companies.length === 0 && <p className="text-xs text-amber-700 mb-3">Bạn cần thêm một công ty trước, rồi mới thêm dự án vào công ty đó.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {isProject && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Thuộc công ty *</label>
                <select className="input-field" value={form.parent_id} onChange={set('parent_id')}>
                  <option value="">Chọn công ty...</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{meta.nameLabel} *</label>
              <input className="input-field" maxLength={200} value={form.company_name} onChange={set('company_name')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{meta.roleLabel} *</label>
              <input className="input-field" maxLength={150} value={form.job_title} onChange={set('job_title')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày bắt đầu *</label>
              <input type="date" className="input-field" value={form.start_date} onChange={set('start_date')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày kết thúc (để trống nếu hiện tại)</label>
              <input type="date" className="input-field" min={form.start_date || undefined} value={form.end_date} onChange={set('end_date')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả ngắn</label>
              <textarea className="input-field resize-none" rows={2} value={form.description} onChange={set('description')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Việc cụ thể đã làm (mỗi dòng một việc)</label>
              <textarea className="input-field resize-none" rows={4} value={form.tasksText} onChange={set('tasksText')} placeholder={'Thiết kế API thanh toán\nTối ưu truy vấn, giảm 40% thời gian phản hồi'} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Công nghệ / kỹ năng (cách nhau bằng dấu phẩy)</label>
              <input className="input-field" value={form.techText} onChange={set('techText')} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link demo / GitHub</label>
              <input className="input-field" value={form.link_url} onChange={set('link_url')} placeholder="https://github.com/..." />
            </div>
          </div>
          {form.end_date && form.end_date < form.start_date && <p className="text-xs text-red-600 mt-2">Ngày kết thúc phải sau ngày bắt đầu.</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={submit} disabled={invalid || saveMutation.isPending} className="btn-primary text-sm">
              {saveMutation.isPending ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm')}
            </button>
            <button onClick={close} className="btn-secondary text-sm">Hủy</button>
          </div>
        </div>
      )}

      <ExperienceTimeline
        experiences={experiences}
        devhubProjects={devhubProjects}
        editable
        onEdit={startEdit}
        onDelete={handleDelete}
        onAddProject={(company) => openAdd({ type: 'PROJECT', parent_id: company.id, start_date: company.start_date || '' })}
        emptyHint="Chưa có kinh nghiệm nào. Hãy thêm công ty, dự án hoặc dự án cá nhân của bạn."
      />
    </div>
  );
}
