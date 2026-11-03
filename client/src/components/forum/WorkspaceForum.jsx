import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/api/forumApi';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ForumThreadView from '@/components/forum/ForumThreadView';
import NewThreadForm from '@/components/forum/NewThreadForm';
import { Pager, ThreadRow } from '@/components/forum/ForumParts';

// Diễn đàn riêng của một workspace: chỉ thành viên của workspace và Admin xem / đăng được
export default function WorkspaceForum({ workspaceId }) {
  const [threadId, setThreadId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('latest');

  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-threads', 'workspace', workspaceId, sort, page],
    queryFn: () => forumApi.getThreads({ workspace_id: workspaceId, sort, page }).then((r) => r.data),
    retry: false,
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50/50">
      <div className="max-w-5xl mx-auto space-y-4">
        {threadId ? (
          <ForumThreadView threadId={threadId} embedded onBack={() => setThreadId(null)} backLabel="Danh sách chủ đề của dự án" />
        ) : creating ? (
          <>
            <h2 className="text-lg font-bold text-slate-900">Mở chủ đề mới trong dự án</h2>
            <NewThreadForm workspaceId={workspaceId} onCancel={() => setCreating(false)} onCreated={(id) => { setCreating(false); setThreadId(id); }} />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Icon name="comments" className="w-5 h-5 text-primary-600" />Diễn đàn của dự án</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1"><Icon name="lock" className="w-3.5 h-3.5" />Chỉ thành viên của dự án và quản trị viên nhìn thấy các chủ đề ở đây.</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <select className="input-field !py-1.5 text-sm w-auto" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="Sắp xếp">
                  <option value="latest">Mới hoạt động</option><option value="new">Mới nhất</option><option value="hot">Nổi bật</option>
                </select>
                <button type="button" className="btn-primary text-sm !py-1.5" onClick={() => setCreating(true)}><Icon name="plus" className="w-4 h-4" />Chủ đề mới</button>
              </div>
            </div>

            {isLoading ? <LoadingSpinner /> : error ? (
              <div className="card text-center py-10 text-slate-500">{error.response?.data?.message || 'Không tải được diễn đàn của dự án'}</div>
            ) : (
              <section className="card !p-0 overflow-hidden">
                {data.data.length ? (
                  <ul className="divide-y divide-slate-100">
                    {data.data.map((t) => <ThreadRow key={t.id} thread={t} showCategory={false} onOpen={() => setThreadId(t.id)} />)}
                  </ul>
                ) : (
                  <div className="py-14 text-center">
                    <IconBadge name="comments" tone="blue" size="lg" className="mx-auto" />
                    <p className="mt-3 font-semibold text-slate-800">Dự án chưa có chủ đề nào</p>
                    <p className="text-sm text-slate-500 mt-1">Mở chủ đề để trao đổi riêng với các thành viên trong dự án.</p>
                    <button type="button" className="btn-primary mt-4" onClick={() => setCreating(true)}>Mở chủ đề đầu tiên</button>
                  </div>
                )}
              </section>
            )}
            {data && <Pager page={page} totalPages={data.pagination.totalPages} onChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
}
