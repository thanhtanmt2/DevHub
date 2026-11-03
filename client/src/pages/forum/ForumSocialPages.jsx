import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/common/Avatar';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MemberCard from '@/components/forum/MemberCard';
import { REASON_LABEL } from '@/components/forum/ReportDialog';
import SanctionDialog from '@/components/forum/SanctionDialog';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { Pager, apiMessage, memberTitle } from '@/components/forum/ForumParts';
import { Hero, Shell } from '@/pages/forum/ForumPages';
import { timeAgo } from '@/utils/timeAgo';

const Crumb = ({ children }) => (
  <div className="flex items-center gap-2 text-sm text-slate-500">
    <Link to="/forum" className="hover:text-primary-700">Diễn đàn</Link>
    <Icon name="chevronRight" className="w-3.5 h-3.5 text-slate-300" />
    <span className="text-slate-700 font-medium">{children}</span>
  </div>
);

const MAX_MESSAGE = 2000;
const timeOf = (v) => new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const dayOf = (v) => new Date(v).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

// ─── /forum/messages — tin nhắn riêng ─────────────────────────────────────────
function Chat({ peerId, onBack }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [memberId, setMemberId] = useState(null);
  const scroller = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-messages', 'with', peerId],
    queryFn: () => forumApi.getConversation(peerId).then((r) => r.data.data),
    refetchInterval: 6000, // trò chuyện gần như thời gian thực mà không cần mở kết nối riêng
    retry: false,
  });
  const send = useMutation({
    mutationFn: (content) => forumApi.sendMessage(peerId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum-messages'] });
      qc.invalidateQueries({ queryKey: ['forum-overview'] });
    },
    onError: (err, content) => { toast.error(apiMessage(err, 'Chưa gửi được tin nhắn')); setText((cur) => cur || content); },
  });

  const count = data?.messages.length || 0;
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight }); }, [count, peerId]);
  useEffect(() => { setText(''); }, [peerId]);

  const submit = () => {
    const content = text.trim();
    if (!content || send.isPending) return;
    setText('');
    send.mutate(content);
  };

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <IconBadge name="mail" size="lg" />
        <p className="font-semibold text-slate-800">{error?.response?.data?.message || 'Không mở được cuộc trò chuyện'}</p>
        <button type="button" onClick={onBack} className="btn-secondary text-sm">Quay lại</button>
      </div>
    );
  }

  const { user: peer, messages, can_send } = data;
  const lastMineIndex = messages.reduce((acc, m, i) => (m.mine ? i : acc), -1);
  return (
    <>
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <button type="button" onClick={onBack} aria-label="Quay lại danh sách" className="md:hidden w-8 h-8 -ml-1 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"><Icon name="chevronLeft" className="w-5 h-5" /></button>
        <button type="button" onClick={() => setMemberId(peer.id)} className="flex items-center gap-3 min-w-0 text-left" title="Xem thông tin thành viên">
          <Avatar name={peer.full_name} src={peer.avatar_url} size="md" />
          <span className="min-w-0">
            <span className="block font-bold text-primary-700 leading-tight truncate hover:underline">{peer.full_name}</span>
            <span className="block text-xs text-slate-500 truncate">{memberTitle(peer)}</span>
          </span>
        </button>
      </header>

      <div ref={scroller} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-1 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500">
            <IconBadge name="mail" tone="blue" size="lg" />
            <p className="font-semibold text-slate-700">Bắt đầu cuộc trò chuyện với {peer.full_name}</p>
            <p className="text-sm">Hãy gửi lời chào đầu tiên.</p>
          </div>
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const newDay = !prev || new Date(prev.created_at).toDateString() !== new Date(m.created_at).toDateString();
          const groupStart = !prev || prev.mine !== m.mine || newDay;
          return (
            <div key={m.id}>
              {newDay && <p className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">{dayOf(m.created_at)}</p>}
              <div className={`flex ${m.mine ? 'justify-end' : 'justify-start'} ${groupStart ? 'mt-2' : ''}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed break-words whitespace-pre-wrap ${m.mine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-slate-800 ring-1 ring-slate-200 rounded-bl-md'}`}>
                  {m.content}
                  <span className={`block mt-0.5 text-[10px] leading-none ${m.mine ? 'text-white/70 text-right' : 'text-slate-400'}`}>{timeOf(m.created_at)}</span>
                </div>
              </div>
              {i === lastMineIndex && m.read && <p className="mt-0.5 text-right text-[11px] text-slate-400">Đã xem</p>}
            </div>
          );
        })}
      </div>

      <footer className="border-t border-slate-100 p-3">
        {can_send ? (
          <>
          <div className="flex items-end gap-2">
            <textarea
              className="input-field !rounded-xl resize-none max-h-32 min-h-[2.5rem]"
              rows={1}
              placeholder="Nhập tin nhắn..."
              value={text}
              maxLength={MAX_MESSAGE}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
              aria-label="Nội dung tin nhắn"
            />
            <button type="button" onClick={submit} disabled={!text.trim() || send.isPending} className="btn-primary !px-3.5 h-10 flex-shrink-0" aria-label="Gửi tin nhắn" title="Gửi">
              <Icon name="send" className="w-5 h-5" />
            </button>
          </div>
          <p className="hidden sm:block mt-1.5 text-[11px] text-slate-400">Enter để gửi · Shift + Enter để xuống dòng</p>
          </>
        ) : (
          <p className="text-sm text-slate-500 text-center py-1.5 flex items-center justify-center gap-2"><Icon name="ban" className="w-4 h-4" />Thành viên này không nhận tin nhắn từ bạn.</p>
        )}
      </footer>
      {memberId && <MemberCard userId={memberId} onClose={() => setMemberId(null)} />}
    </>
  );
}

export function ForumMessagesPage() {
  const [params, setParams] = useSearchParams();
  const withId = params.get('with') || '';
  const { data, isLoading } = useQuery({
    queryKey: ['forum-messages', 'list'],
    queryFn: () => forumApi.getConversations().then((r) => r.data),
    refetchInterval: 15000,
  });
  const open = (id) => setParams(id ? { with: id } : {});
  const list = data?.data || [];

  return (
    <Shell>
      <Crumb>Tin nhắn</Crumb>
      <div className="card !p-0 overflow-hidden grid md:grid-cols-[19rem_minmax(0,1fr)] h-[calc(100dvh-12rem)] min-h-[30rem]">
        <aside className={`${withId ? 'hidden md:flex' : 'flex'} flex-col min-h-0 md:border-r border-slate-100`}>
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h1 className="font-bold text-slate-900 flex items-center gap-2"><Icon name="mail" className="w-5 h-5 text-sky-600" />Tin nhắn</h1>
            {data?.unread_total > 0 && <span className="px-2 py-0.5 rounded-full bg-primary-600 text-white text-xs font-bold">{data.unread_total} mới</span>}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoading ? <div className="py-10"><LoadingSpinner /></div> : list.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                <IconBadge name="mail" tone="blue" size="lg" className="mx-auto" />
                <p className="mt-3 font-semibold text-slate-800">Chưa có tin nhắn nào</p>
                <p className="mt-1">Bấm vào ảnh đại diện của một thành viên trong diễn đàn rồi chọn <strong>Gửi tin nhắn</strong> để bắt đầu.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.map((c) => (
                  <li key={c.user.id}>
                    <button type="button" onClick={() => open(c.user.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${withId === c.user.id ? 'bg-primary-50' : 'hover:bg-slate-50'}`}>
                      <Avatar name={c.user.full_name} src={c.user.avatar_url} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate ${c.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{c.user.full_name}</span>
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">{timeAgo(c.last_at)}</span>
                        </span>
                        <span className="flex items-center justify-between gap-2">
                          <span className={`truncate text-sm ${c.unread ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>{c.last_mine ? 'Bạn: ' : ''}{c.last_message}</span>
                          {c.unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{c.unread}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className={`${withId ? 'flex' : 'hidden md:flex'} flex-col min-h-0`}>
          {withId ? <Chat peerId={withId} onBack={() => open('')} /> : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-slate-500 p-6">
              <IconBadge name="mail" tone="blue" size="lg" />
              <p className="font-semibold text-slate-700">Chọn một cuộc trò chuyện để xem</p>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

// ─── /forum/saved — bài viết đã lưu ──────────────────────────────────────────
export function ForumSavedPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['forum-saved', page],
    queryFn: () => forumApi.getBookmarks({ page }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
  const unsave = useMutation({
    mutationFn: (postId) => forumApi.toggleBookmark(postId),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['forum-saved'] }); qc.invalidateQueries({ queryKey: ['forum-thread'] }); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa bỏ lưu được')),
  });

  return (
    <Shell>
      <Crumb>Bài viết đã lưu</Crumb>
      <Hero title="Bài viết đã lưu" subtitle="Những bài viết bạn đánh dấu để đọc lại sau. Bấm biểu tượng lưu ở góc mỗi bài để thêm vào đây." />
      <section className="card !p-0 overflow-hidden">
        {isLoading ? <div className="py-12"><LoadingSpinner /></div> : data?.data.length ? (
          <ul className="divide-y divide-slate-100">
            {data.data.map((b) => (
              <li key={b.post_id} className="relative flex items-start gap-3 px-4 sm:px-5 py-3.5 hover:bg-amber-50/30 transition-colors">
                <Avatar name={b.author?.full_name} src={b.author?.avatar_url} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">
                    <Link to={`/forum/t/${b.thread_id}?post=${b.post_id}`} className="hover:text-primary-700 after:absolute after:inset-0">{b.title}</Link>
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600 line-clamp-2 break-words">{b.excerpt}</p>
                  <p className="mt-1 text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5">
                    <span className="font-medium text-slate-600">{b.author?.full_name || 'Ẩn danh'}</span>
                    <span>· {b.is_workspace ? 'Diễn đàn dự án' : b.category_name}</span>
                    <span>· Đã lưu {timeAgo(b.saved_at)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => unsave.mutate(b.post_id)}
                  disabled={unsave.isPending}
                  title="Bỏ lưu"
                  aria-label="Bỏ lưu bài viết"
                  className="relative z-10 w-8 h-8 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center flex-shrink-0"
                ><Icon name="bookmark" filled className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-14 text-center">
            <IconBadge name="bookmark" tone="amber" size="lg" className="mx-auto" />
            <p className="mt-3 font-semibold text-slate-800">Bạn chưa lưu bài viết nào</p>
            <Link to="/forum" className="btn-primary mt-4 inline-flex">Về diễn đàn</Link>
          </div>
        )}
        {data && <div className="p-4 border-t"><Pager page={page} totalPages={data.pagination.totalPages} onChange={setPage} /></div>}
      </section>
    </Shell>
  );
}

// ─── /forum/reports — hàng đợi báo cáo (Admin) ───────────────────────────────
const TABS = [{ v: 'OPEN', l: 'Chờ xử lý' }, { v: 'RESOLVED', l: 'Đã xử lý' }, { v: 'DISMISSED', l: 'Đã bỏ qua' }, { v: 'WARNINGS', l: 'Cảnh cáo' }];
const ACTION_LABEL = { warn: 'Đã cảnh cáo', lock: 'Đã khóa tài khoản', delete: 'Đã xóa bài', 'warn+delete': 'Đã cảnh cáo và xóa bài', 'lock+delete': 'Đã khóa tài khoản và xóa bài' };

// Chip "Đã bị cảnh cáo n/3 lần" + "Tài khoản đã bị khóa"
const WarnChips = ({ warnings, locked, max }) => (
  <>
    {warnings > 0 && <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ring-1 ring-inset ${warnings >= max - 1 ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-800 ring-amber-200'}`}>Đã bị cảnh cáo {warnings}/{max} lần</span>}
    {locked && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">Tài khoản đã bị khóa</span>}
  </>
);

// Lịch sử cảnh cáo: ai bị cảnh cáo, vì bài nào, ai cảnh cáo; gỡ được khi xử nhầm
function WarningsTab({ enabled }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['forum-warnings', page],
    queryFn: () => forumApi.getWarnings({ page }).then((r) => r.data),
    enabled,
    placeholderData: keepPreviousData,
  });
  const revoke = useMutation({
    mutationFn: (id) => forumApi.revokeWarning(id),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['forum-warnings'] }); qc.invalidateQueries({ queryKey: ['forum-reports'] }); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa gỡ được cảnh cáo')),
  });
  const onRevoke = async (w) => {
    const ok = await confirm({ title: 'Gỡ cảnh cáo', message: `Gỡ lần cảnh cáo này của ${w.user.full_name}? Tài khoản sẽ không tự động được mở khóa, nếu đang bị khóa hãy mở ở trang Quản lý người dùng.`, confirmText: 'Gỡ cảnh cáo', tone: 'danger' });
    if (ok) revoke.mutate(w.id);
  };
  if (isLoading) return <LoadingSpinner />;
  return (
    <>
      {data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((w) => (
            <li key={w.id} className="card !p-4 sm:!p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Avatar name={w.user.full_name} src={w.user.avatar_url} size="sm" />
                <strong className="text-slate-900">{w.user.full_name}</strong>
                <WarnChips warnings={w.user.warnings} locked={w.user.locked} max={data.max_warnings} />
                <span className="ml-auto text-xs text-slate-400">{w.issuer_name ? `${w.issuer_name} · ` : ''}{timeAgo(w.created_at)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700 break-words"><span className="font-semibold">Lời nhắn:</span> {w.message}</p>
              <div className="mt-2 rounded-lg border-l-4 border-amber-400 bg-amber-50/50 px-3 py-2">
                <p className="text-xs text-slate-500">Bài viết trong <strong className="text-slate-700">{w.thread_title}</strong>{w.reason && <> · {REASON_LABEL[w.reason] || w.reason}</>}{w.post_deleted && <> · <span className="text-red-600 font-semibold">đã bị xóa</span></>}</p>
                <p className="mt-0.5 text-sm text-slate-700 break-words">{w.post_excerpt}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {w.post_link ? <Link to={w.post_link} className="btn-secondary text-sm !py-1.5"><Icon name="external" className="w-4 h-4" />Mở bài viết</Link> : <span className="text-xs text-slate-400">Bài viết không còn trên diễn đàn</span>}
                <button type="button" onClick={() => onRevoke(w)} disabled={revoke.isPending} className="ml-auto btn-secondary text-sm !py-1.5">Gỡ cảnh cáo</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card text-center py-14">
          <IconBadge name="verified" tone="green" size="lg" className="mx-auto" />
          <p className="mt-3 font-semibold text-slate-800">Chưa có cảnh cáo nào</p>
        </div>
      )}
      {data && <Pager page={page} totalPages={data.pagination.totalPages} onChange={setPage} />}
    </>
  );
}
const REASON_TONE = { SPAM: 'bg-amber-50 text-amber-800 ring-amber-200', OFFENSIVE: 'bg-red-50 text-red-700 ring-red-200', ILLEGAL: 'bg-rose-50 text-rose-700 ring-rose-200', OTHER: 'bg-slate-100 text-slate-600 ring-slate-200' };

export function ForumReportsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(1);
  const allowed = isAdmin();
  const warningsTab = status === 'WARNINGS';
  const reportStatus = warningsTab ? 'OPEN' : status; // tab Cảnh cáo vẫn cần số đếm của các tab từ cùng truy vấn này
  const { data, isLoading } = useQuery({
    queryKey: ['forum-reports', reportStatus, warningsTab ? 1 : page],
    queryFn: () => forumApi.getReports({ status: reportStatus, page: warningsTab ? 1 : page }).then((r) => r.data),
    enabled: allowed,
    placeholderData: keepPreviousData,
  });
  const [sanction, setSanction] = useState(null);
  const handle = useMutation({
    mutationFn: ({ id, value }) => forumApi.handleReport(id, value),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['forum-reports'] }); qc.invalidateQueries({ queryKey: ['forum-overview'] }); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa xử lý được báo cáo')),
  });

  if (!allowed) {
    return <Shell><div className="card text-center py-14 max-w-lg mx-auto"><IconBadge name="lock" size="lg" className="mx-auto" /><p className="mt-3 font-semibold text-slate-800">Chỉ quản trị viên xem được trang này</p><Link to="/forum" className="btn-primary mt-4 inline-flex">Về diễn đàn</Link></div></Shell>;
  }

  return (
    <Shell>
      <Crumb>Báo cáo vi phạm</Crumb>
      <Hero title="Báo cáo vi phạm" subtitle="Các bài viết thành viên báo cáo. Mở bài để xem ngữ cảnh, rồi cảnh cáo, xóa bài hoặc khóa tài khoản người vi phạm. Đủ 3 lần cảnh cáo tài khoản tự động bị khóa." />
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist">
        {TABS.map((t) => (
          <button key={t.v} type="button" role="tab" aria-selected={status === t.v} onClick={() => { setStatus(t.v); setPage(1); }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${status === t.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700'}`}>
            {t.l}{data?.counts && <span className={`ml-1.5 ${status === t.v ? 'text-white/80' : 'text-slate-400'}`}>{data.counts[t.v]}</span>}
          </button>
        ))}
      </div>

      {warningsTab ? <WarningsTab enabled={allowed} /> : isLoading ? <LoadingSpinner /> : data?.data.length ? (
        <ul className="space-y-3">
          {data.data.map((r) => (
            <li key={r.id} className="card !p-4 sm:!p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ring-1 ring-inset ${REASON_TONE[r.reason] || REASON_TONE.OTHER}`}><Icon name="flag" className="w-3.5 h-3.5" />{REASON_LABEL[r.reason] || r.reason_label}</span>
                <span className="text-slate-500">bởi <strong className="text-slate-700">{r.reporter.full_name}</strong> · {timeAgo(r.created_at)}</span>
                {r.thread.is_workspace && <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-semibold">Diễn đàn dự án</span>}
              </div>
              {r.note && <p className="mt-2 text-sm text-slate-700 break-words">&ldquo;{r.note}&rdquo;</p>}

              <div className="mt-3 rounded-lg border-l-4 border-orange-400 bg-orange-50/50 px-3 py-2">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  {r.post.author && <Avatar name={r.post.author.full_name} src={r.post.author.avatar_url} size="xs" />}
                  <strong className="text-slate-700">{r.post.author?.full_name || 'Tài khoản đã xóa'}</strong>
                  {r.post.author && <WarnChips warnings={r.post.author.warnings} locked={r.post.author.locked} max={data.max_warnings} />}
                  <span>trong</span>
                  <Link to={`/forum/t/${r.thread.id}?post=${r.post.id}`} className="font-semibold text-primary-700 hover:underline truncate">{r.thread.title}</Link>
                </p>
                <p className="mt-1 text-sm text-slate-700 break-words">{r.post.excerpt}</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link to={`/forum/t/${r.thread.id}?post=${r.post.id}`} className="btn-secondary text-sm !py-1.5"><Icon name="external" className="w-4 h-4" />Mở bài viết</Link>
                {r.status === 'OPEN' ? (
                  <span className="ml-auto flex flex-wrap gap-2">
                    <button type="button" disabled={handle.isPending} onClick={() => handle.mutate({ id: r.id, value: 'DISMISSED' })} className="btn-secondary text-sm !py-1.5">Bỏ qua báo cáo</button>
                    <button type="button" disabled={handle.isPending} onClick={() => handle.mutate({ id: r.id, value: 'RESOLVED' })} className="btn-secondary text-sm !py-1.5"><Icon name="check" className="w-4 h-4" />Đã xử lý</button>
                    {r.post.author?.role !== 'ADMIN' && <button type="button" onClick={() => setSanction(r)} className="btn-danger text-sm !py-1.5"><Icon name="shield" className="w-4 h-4" />Xử phạt</button>}
                  </span>
                ) : <span className="ml-auto text-xs text-slate-400">{r.status === 'RESOLVED' ? (ACTION_LABEL[r.action] || 'Đã xử lý') : 'Đã bỏ qua'}{r.handled_at ? ` · ${timeAgo(r.handled_at)}` : ''}</span>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card text-center py-14">
          <IconBadge name="verified" tone="green" size="lg" className="mx-auto" />
          <p className="mt-3 font-semibold text-slate-800">{status === 'OPEN' ? 'Không có báo cáo nào đang chờ xử lý' : 'Chưa có báo cáo nào ở mục này'}</p>
        </div>
      )}
      {data && !warningsTab && <Pager page={page} totalPages={data.pagination.totalPages} onChange={setPage} />}
      {sanction && (
        <SanctionDialog
          report={sanction}
          maxWarnings={data.max_warnings}
          onClose={() => setSanction(null)}
          onDone={() => { ['forum-reports', 'forum-warnings', 'forum-overview', 'forum-thread', 'forum-threads'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); }}
        />
      )}
    </Shell>
  );
}
