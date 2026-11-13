import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import { apiMessage } from '@/components/forum/ForumParts';

const MAX = 10000;

// Form mở chủ đề mới: chọn chuyên mục (diễn đàn chung) hoặc gắn sẵn workspaceId (diễn đàn dự án)
export default function NewThreadForm({ categories = [], defaultCategoryId = '', workspaceId = null, onCreated, onCancel }) {
  const qc = useQueryClient();
  const [categoryId, setCategoryId] = useState(defaultCategoryId || categories[0]?.id || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const create = useMutation({
    mutationFn: () => forumApi.createThread({ title, content, ...(workspaceId ? { workspace_id: workspaceId } : { category_id: categoryId }) }),
    onSuccess: (res) => {
      toast.success('Đã đăng chủ đề');
      qc.invalidateQueries({ queryKey: ['forum-threads'] });
      qc.invalidateQueries({ queryKey: ['forum-overview'] });
      onCreated(res.data.data.id);
    },
    onError: (err) => toast.error(apiMessage(err, 'Chưa đăng được chủ đề')),
  });
  const valid = title.trim().length >= 5 && content.trim().length >= 2 && (workspaceId || categoryId);

  return (
    <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); if (valid && !create.isPending) create.mutate(); }}>
      {!workspaceId && (
        <div>
          <label htmlFor="ft-cat" className="block text-sm font-medium text-slate-700 mb-1">Chuyên mục</label>
          <select id="ft-cat" className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="ft-title" className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
        <input id="ft-title" className="input-field" placeholder="Tiêu đề rõ ràng, ngắn gọn" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <p className="mt-1 text-xs text-slate-400">{title.length}/200</p>
      </div>
      <div>
        <label htmlFor="ft-content" className="block text-sm font-medium text-slate-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
        <textarea id="ft-content" className="input-field min-h-[12rem] resize-y" placeholder="Nội dung bài viết... (dán liên kết sẽ tự nhận; dùng ``` để chèn khối mã)" maxLength={MAX} value={content} onChange={(e) => setContent(e.target.value)} />
        <p className="mt-1 text-xs text-slate-400">{content.length.toLocaleString('vi-VN')}/{MAX.toLocaleString('vi-VN')}</p>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Hủy</button>}
        <button className="btn-primary" disabled={!valid || create.isPending}>{create.isPending ? 'Đang đăng...' : 'Đăng chủ đề'}</button>
      </div>
    </form>
  );
}
