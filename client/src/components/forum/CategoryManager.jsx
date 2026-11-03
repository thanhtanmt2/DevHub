import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import Icon from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import { CategoryTile, apiMessage } from '@/components/forum/ForumParts';

const EMPTY = { name: '', description: '', icon: 'chat', sort_order: 0, admin_only: false };

// Admin quản lý chuyên mục diễn đàn: thêm, sửa, xóa (chỉ xóa được chuyên mục trống)
export default function CategoryManager({ categories, onClose }) {
  useEscapeKey(onClose);
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [form, setForm] = useState(null); // { id?, ...fields }
  const refresh = () => { qc.invalidateQueries({ queryKey: ['forum-overview'] }); };

  const save = useMutation({
    mutationFn: (f) => (f.id ? forumApi.updateCategory(f.id, f) : forumApi.createCategory(f)),
    onSuccess: (res) => { toast.success(res.data.message); setForm(null); refresh(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa lưu được chuyên mục')),
  });
  const remove = useMutation({
    mutationFn: (id) => forumApi.deleteCategory(id),
    onSuccess: (res) => { toast.success(res.data.message); refresh(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa xóa được chuyên mục')),
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quản lý chuyên mục diễn đàn</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-slate-400 hover:text-slate-700"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        {form ? (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tên chuyên mục</label><input className="input-field" value={form.name} onChange={set('name')} maxLength={100} required autoFocus /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Mô tả ngắn</label><input className="input-field" value={form.description || ''} onChange={set('description')} maxLength={255} /></div>
            <div className="grid sm:grid-cols-2 gap-3 items-end">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Thứ tự hiển thị</label><input type="number" className="input-field" value={form.sort_order} onChange={set('sort_order')} /></div>
              <label className="flex items-center gap-2 text-sm text-slate-700 pb-2"><input type="checkbox" checked={!!form.admin_only} onChange={set('admin_only')} className="w-4 h-4" />Chỉ quản trị viên được đăng bài</label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setForm(null)}>Hủy</button>
              <button className="btn-primary" disabled={save.isPending}>{save.isPending ? 'Đang lưu...' : 'Lưu chuyên mục'}</button>
            </div>
          </form>
        ) : (
          <>
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <CategoryTile size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{c.name}{c.admin_only && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold">Chỉ quản trị</span>}</p>
                    <p className="text-xs text-slate-500 truncate">{c.thread_count} chủ đề · thứ tự {c.sort_order}</p>
                  </div>
                  <button type="button" onClick={() => setForm({ id: c.id, name: c.name, description: c.description, icon: c.icon, sort_order: c.sort_order, admin_only: c.admin_only })} className="text-sm font-semibold text-primary-700 hover:underline">Sửa</button>
                  <button
                    type="button"
                    onClick={async () => { if (await confirm({ title: 'Xóa chuyên mục', message: `Xóa chuyên mục "${c.name}"? Chỉ xóa được khi chuyên mục chưa có chủ đề nào.`, confirmText: 'Xóa', tone: 'danger' })) remove.mutate(c.id); }}
                    aria-label={`Xóa ${c.name}`} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  ><Icon name="trash" className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-primary mt-4" onClick={() => setForm({ ...EMPTY, sort_order: (categories.at(-1)?.sort_order || 0) + 1 })}><Icon name="plus" className="w-4 h-4" />Thêm chuyên mục</button>
          </>
        )}
      </div>
    </div>
  );
}
