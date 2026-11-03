import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { forumApi } from '@/api/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { AuthorPanel, Pager, PostContent, StatChip, ThreadBadges, apiMessage, copyText } from '@/components/forum/ForumParts';
import MemberCard from '@/components/forum/MemberCard';
import ReportDialog from '@/components/forum/ReportDialog';

const MAX = 10000;

// Khung soạn bài trả lời (có thể kèm trích dẫn)
function Composer({ quote, onClearQuote, onSubmit, pending, initial = '', submitLabel = 'Gửi trả lời', onCancel, autoFocus = false }) {
  const [text, setText] = useState(initial);
  const ref = useRef(null);
  useEffect(() => { if (quote) ref.current?.focus(); }, [quote]);
  const submit = () => { if (text.trim().length >= 2 && !pending) onSubmit(text, () => setText('')); };
  return (
    <div>
      {quote && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border-l-4 border-primary-400 bg-primary-50/60 px-3 py-2 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-primary-800">Trả lời {quote.author?.full_name}</p>
            <p className="text-slate-600 line-clamp-2 break-words">{quote.content}</p>
          </div>
          <button type="button" onClick={onClearQuote} aria-label="Bỏ trích dẫn" className="text-slate-400 hover:text-slate-700"><Icon name="x" className="w-4 h-4" /></button>
        </div>
      )}
      <textarea
        ref={ref}
        autoFocus={autoFocus}
        className="input-field min-h-[7rem] resize-y"
        placeholder="Nhập nội dung... (dán liên kết sẽ tự nhận; dùng ``` để chèn khối mã)"
        value={text}
        maxLength={MAX}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); submit(); } }}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-slate-400">{text.length.toLocaleString('vi-VN')}/{MAX.toLocaleString('vi-VN')} · Ctrl + Enter để gửi</span>
        <span className="flex items-center gap-2">
          {onCancel && <button type="button" onClick={onCancel} className="btn-secondary text-sm !py-1.5">Hủy</button>}
          <button type="button" onClick={submit} disabled={pending || text.trim().length < 2} className="btn-primary text-sm !py-1.5">{pending ? 'Đang gửi...' : submitLabel}</button>
        </span>
      </div>
    </div>
  );
}

const ACTION = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold ring-1 ring-inset ring-slate-200 text-slate-600 transition-colors';

// Nút biểu tượng nhỏ ở tiêu đề bài (chia sẻ, lưu bài)
const HeadIcon = ({ title, onClick, active = false, activeCls = '', hoverCls = 'hover:bg-slate-100 hover:text-slate-700', disabled = false, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={`w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors disabled:opacity-60 ${active ? activeCls : `text-slate-400 ${hoverCls}`}`}
  >{children}</button>
);

// Nút cảm xúc nhỏ: hình tròn có biểu tượng ngón tay cái (lên = Thích, xuống = Không thích), kèm số lượt nếu có.
// Bình thường viền xám; rê chuột sáng lên theo màu; đang chọn thì tô đặc màu và biểu tượng trắng.
const REACTION_TONE = {
  like: { on: 'bg-primary-600 text-white ring-primary-600', idle: 'hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200' },
  dislike: { on: 'bg-red-500 text-white ring-red-500', idle: 'hover:bg-red-50 hover:text-red-600 hover:ring-red-200' },
};
function ReactionButton({ kind, icon, count, active, disabled, locked, title, label, onClick }) {
  const tone = REACTION_TONE[kind];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1 h-8 min-w-[2rem] rounded-full text-xs font-bold ring-1 ring-inset transition-colors disabled:cursor-not-allowed ${count > 0 ? 'px-2.5' : 'px-0'} ${active ? tone.on : `bg-white text-slate-500 ring-slate-200 ${locked ? 'opacity-50' : tone.idle}`}`}
    >
      <Icon name={icon} strokeWidth={active ? 2.2 : 1.8} className="w-[18px] h-[18px]" />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

// "A, B, C và N người khác đã thích bài viết này"
function LikedBy({ post, onOpen }) {
  const shown = post.liked_by.slice(0, 3);
  const more = Math.max(0, post.like_count - shown.length);
  return (
    <>
      {shown.map((p, i) => (
        <span key={p.id}>
          {i > 0 && (i === shown.length - 1 && more === 0 ? ' và ' : ', ')}
          <button type="button" onClick={() => onOpen(p.id)} className="font-semibold text-slate-800 hover:text-primary-700 hover:underline">{p.full_name}</button>
        </span>
      ))}
      {more > 0 && <> và {more} người khác</>} đã thích bài viết này
    </>
  );
}

function PostCard({ post, thread, onQuote, onChanged, canReply, onOpenAuthor, onJump }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const { user, openLoginModal } = useAuth();
  const [editing, setEditing] = useState(false);
  const [reveal, setReveal] = useState(false); // xem nội dung của bài bị ẩn (do đã bỏ qua tác giả)
  const [reporting, setReporting] = useState(false);

  const like = useMutation({
    mutationFn: () => forumApi.toggleLike(post.id),
    onSuccess: onChanged,
    onError: (err) => toast.error(apiMessage(err, 'Chưa thích được bài viết')),
  });
  const dislike = useMutation({
    mutationFn: () => forumApi.toggleDislike(post.id),
    onSuccess: onChanged,
    onError: (err) => toast.error(apiMessage(err, 'Chưa đánh giá được bài viết')),
  });
  const reacting = like.isPending || dislike.isPending;
  const bookmark = useMutation({
    mutationFn: () => forumApi.toggleBookmark(post.id),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['forum-saved'] }); onChanged(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa lưu được bài viết')),
  });
  const edit = useMutation({
    mutationFn: (content) => forumApi.updatePost(post.id, content),
    onSuccess: () => { toast.success('Đã cập nhật bài viết'); setEditing(false); onChanged(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa sửa được bài viết')),
  });
  const remove = useMutation({
    mutationFn: () => forumApi.deletePost(post.id),
    onSuccess: (res) => { toast.success(res.data.message); qc.invalidateQueries({ queryKey: ['forum-threads'] }); onChanged(res.data.deleted_thread); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa xóa được bài viết')),
  });

  const onDelete = async () => {
    const ok = await confirm({
      title: post.is_op ? 'Xóa chủ đề' : 'Xóa bài viết',
      message: post.is_op ? 'Xóa bài gốc sẽ xóa toàn bộ chủ đề và các bài trả lời. Thao tác này không hoàn tác được.' : 'Bạn có chắc muốn xóa bài viết này không?',
      confirmText: 'Xóa', tone: 'danger',
    });
    if (ok) remove.mutate();
  };
  const share = async () => {
    const ok = await copyText(`${window.location.origin}/forum/t/${thread.id}?post=${post.id}`);
    if (ok) toast.success('Đã sao chép liên kết bài viết'); else toast.error('Không sao chép được liên kết');
  };

  if (post.ignored && !reveal) {
    return (
      <article id={`post-${post.id}`} className="card !p-0 overflow-hidden scroll-mt-24">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 bg-slate-50/70 text-sm text-slate-500">
          <Icon name="ban" className="w-4 h-4 text-slate-400" />
          <span className="min-w-0 flex-1">Bài viết #{post.number} của <strong className="text-slate-700">{post.author?.full_name}</strong> đã bị ẩn vì bạn đã bỏ qua thành viên này.</span>
          <button type="button" onClick={() => setReveal(true)} className="font-semibold text-primary-700 hover:underline">Xem nội dung</button>
        </div>
      </article>
    );
  }

  return (
    <article id={`post-${post.id}`} className="card !p-0 overflow-hidden scroll-mt-24">
      <div className="grid md:grid-cols-[11.5rem_minmax(0,1fr)]">
        <div className="p-4 md:border-r border-b md:border-b-0 border-slate-100 bg-slate-50/60"><AuthorPanel author={post.author} onOpen={post.author ? () => onOpenAuthor(post.author.id) : undefined} /></div>
        <div className="min-w-0 flex flex-col">
          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            {/* Tiêu đề bài: thời gian bên trái; chia sẻ, lưu bài và số thứ tự bên phải */}
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
              <span>{new Date(post.created_at).toLocaleString('vi-VN')}{post.edited_at && <span className="ml-2 text-slate-400">(đã sửa)</span>}</span>
              <span className="flex items-center gap-0.5">
                <HeadIcon title="Sao chép liên kết bài viết" onClick={share} hoverCls="hover:bg-sky-50 hover:text-sky-600"><Icon name="share" className="w-4 h-4" /></HeadIcon>
                <HeadIcon
                  title={post.bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                  active={post.bookmarked}
                  activeCls="bg-amber-50 text-amber-500"
                  hoverCls="hover:bg-amber-50 hover:text-amber-500"
                  disabled={bookmark.isPending}
                  onClick={() => (user ? bookmark.mutate() : openLoginModal())}
                ><Icon name="bookmark" filled={post.bookmarked} className="w-4 h-4" /></HeadIcon>
                <a href={`#post-${post.id}`} className="ml-1 inline-flex items-center h-6 px-2 rounded-md bg-slate-100 font-bold text-slate-500 hover:bg-primary-50 hover:text-primary-700">#{post.number}</a>
              </span>
            </div>

            {post.quote && (
              <blockquote className="mb-3 rounded-r-lg border-l-4 border-orange-400 bg-orange-50/60 px-3 py-2 text-sm">
                <button type="button" onClick={() => onJump(post.quote.id)} className="font-semibold text-orange-800 hover:underline text-left">{post.quote.author_name} đã viết:</button>
                <p className="mt-0.5 text-slate-600 break-words">{post.quote.excerpt}</p>
              </blockquote>
            )}

            {editing ? (
              <Composer initial={post.content} submitLabel="Lưu thay đổi" pending={edit.isPending} autoFocus onCancel={() => setEditing(false)} onSubmit={(t) => edit.mutate(t)} />
            ) : <PostContent content={post.content} />}

            {!editing && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-sm">
                {/* Bên trái: báo cáo */}
                {(!user || post.can_report) && (post.reported ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400"><Icon name="flag" className="w-3.5 h-3.5" />Đã báo cáo</span>
                ) : (
                  <button type="button" onClick={() => (user ? setReporting(true) : openLoginModal())} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-600 transition-colors">
                    <Icon name="flag" className="w-3.5 h-3.5" />Báo cáo
                  </button>
                ))}

                {/* Bên phải: các thao tác, nút Thích ngoài cùng */}
                <span className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
                  {post.can_delete && (
                    <button type="button" onClick={onDelete} disabled={remove.isPending} className={`${ACTION} !text-slate-500 hover:bg-red-50 hover:!text-red-600 hover:ring-red-200`}>
                      <Icon name="trash" className="w-4 h-4 text-red-400" />Xóa
                    </button>
                  )}
                  {post.can_edit && (
                    <button type="button" onClick={() => setEditing(true)} className={`${ACTION} hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-200`}>
                      <Icon name="pencil" className="w-4 h-4 text-amber-500" />Sửa
                    </button>
                  )}
                  {canReply && (
                    <button type="button" onClick={() => onQuote(post)} className={`${ACTION} hover:bg-sky-50 hover:text-sky-700 hover:ring-sky-200`}>
                      <Icon name="comments" className="w-4 h-4 text-sky-600" />Trích dẫn
                    </button>
                  )}
                  {/* Cảm xúc: hai nút tròn nhỏ Thích / Không thích. Mỗi người một cảm xúc cho mỗi bài; bấm cái còn lại để đổi, bấm lại để bỏ */}
                  <span role="group" aria-label="Cảm xúc" className="inline-flex items-center gap-1.5">
                    <ReactionButton
                      kind="like"
                      icon="thumbUp"
                      count={post.like_count}
                      active={post.liked}
                      locked={!!user && !post.can_like}
                      disabled={reacting || (!!user && !post.can_like)}
                      title={user && !post.can_like ? 'Bạn không thể đánh giá bài viết của chính mình' : post.liked ? 'Bỏ thích' : 'Thích'}
                      label={`${post.liked ? 'Bỏ thích' : 'Thích'}${post.like_count ? `, hiện có ${post.like_count} lượt thích` : ''}`}
                      onClick={() => (user ? like.mutate() : openLoginModal())}
                    />
                    <ReactionButton
                      kind="dislike"
                      icon="thumbDown"
                      count={post.dislike_count}
                      active={post.disliked}
                      locked={!!user && !post.can_like}
                      disabled={reacting || (!!user && !post.can_like)}
                      title={user && !post.can_like ? 'Bạn không thể đánh giá bài viết của chính mình' : post.disliked ? 'Bỏ không thích' : 'Không thích'}
                      label={`${post.disliked ? 'Bỏ không thích' : 'Không thích'}${post.dislike_count ? `, hiện có ${post.dislike_count} lượt không thích` : ''}`}
                      onClick={() => (user ? dislike.mutate() : openLoginModal())}
                    />
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Dải cảm xúc: những ai đã thích (có tên) và số người không thích (không hiện tên) */}
          {!editing && (post.like_count > 0 || post.dislike_count > 0) && (
            <div className="px-4 sm:px-5 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap items-start gap-x-4 gap-y-1">
              {post.like_count > 0 && post.liked_by.length > 0 && (
                <span className="inline-flex items-start gap-2 min-w-0">
                  <Icon name="thumbUp" className="w-4 h-4 mt-px text-primary-600 flex-shrink-0" />
                  <span className="min-w-0 break-words"><LikedBy post={post} onOpen={onOpenAuthor} /></span>
                </span>
              )}
              {post.dislike_count > 0 && (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Icon name="thumbDown" className="w-4 h-4 text-red-500" />{post.dislike_count} người không thích
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {reporting && <ReportDialog postId={post.id} onClose={() => setReporting(false)} onDone={onChanged} />}
    </article>
  );
}

// Trang / khung xem một chủ đề: dùng cho diễn đàn chung (trang riêng) và diễn đàn của workspace (nhúng trong workspace)
export default function ForumThreadView({ threadId, jumpToPost = null, initialPage = 1, embedded = false, onBack, backLabel = 'Quay lại danh sách' }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user, openLoginModal } = useAuth();
  const [page, setPage] = useState(initialPage);
  const [jump, setJump] = useState(jumpToPost);
  const [quote, setQuote] = useState(null);
  const composerRef = useRef(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [memberId, setMemberId] = useState(null); // thành viên đang xem trong khung thông tin
  const [titleDraft, setTitleDraft] = useState('');

  useEffect(() => { setPage(initialPage); setJump(jumpToPost); setQuote(null); }, [threadId, jumpToPost, initialPage]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['forum-thread', threadId, page, jump, user?.id ?? 'guest'],
    queryFn: () => forumApi.getThread(threadId, { page, ...(jump ? { post: jump } : {}) }).then((r) => r.data.data),
    retry: false,
  });
  // Khi nhảy tới một bài, server trả đúng trang chứa bài đó rồi cuộn tới bài
  useEffect(() => {
    if (!data || !jump) return;
    setPage(data.pagination.page);
    const t = setTimeout(() => document.getElementById(`post-${jump}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    setJump(null);
    return () => clearTimeout(t);
  }, [data, jump]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ['forum-thread', threadId] }); qc.invalidateQueries({ queryKey: ['forum-threads'] }); qc.invalidateQueries({ queryKey: ['forum-overview'] }); };

  const reply = useMutation({
    mutationFn: ({ content, quote_post_id }) => forumApi.createPost(threadId, { content, quote_post_id }),
    onSuccess: (res) => { toast.success('Đã đăng bài trả lời'); setQuote(null); setJump(res.data.data.id); refresh(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa đăng được bài trả lời')),
  });
  const flag = useMutation({
    mutationFn: ({ kind, value }) => (kind === 'pin' ? forumApi.pinThread(threadId, value) : forumApi.lockThread(threadId, value)),
    onSuccess: (res) => { toast.success(res.data.message); refresh(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa thực hiện được')),
  });
  const rename = useMutation({
    mutationFn: (title) => forumApi.updateThread(threadId, { title }),
    onSuccess: () => { toast.success('Đã đổi tiêu đề'); setEditingTitle(false); refresh(); },
    onError: (err) => toast.error(apiMessage(err, 'Chưa đổi được tiêu đề')),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    const status = error?.response?.status;
    return (
      <div className="card text-center py-14 max-w-lg mx-auto">
        <IconBadge name={status === 404 ? 'search' : 'lock'} size="lg" className="mx-auto" />
        <p className="mt-3 font-semibold text-slate-800">
          {status === 404 ? 'Không tìm thấy chủ đề' : status === 401 ? 'Cần đăng nhập để xem chủ đề này' : status === 403 ? 'Bạn không có quyền xem chủ đề này' : 'Không tải được chủ đề'}
        </p>
        <p className="text-sm text-slate-500 mt-1">{error?.response?.data?.message}</p>
        <div className="mt-4 flex justify-center gap-2">
          {status === 401 && <button type="button" className="btn-primary" onClick={openLoginModal}>Đăng nhập</button>}
          {!status || status >= 500 ? <button type="button" className="btn-secondary" onClick={() => refetch()}>Thử lại</button> : null}
          {onBack ? <button type="button" className="btn-secondary" onClick={onBack}>{backLabel}</button> : <Link to="/forum" className="btn-secondary">Về diễn đàn</Link>}
        </div>
      </div>
    );
  }

  const { thread, posts, pagination } = data;
  const goPage = (n) => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const jumpTo = (id) => {
    const el = document.getElementById(`post-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); else setJump(id);
  };
  const startQuote = (post) => { setQuote(post); composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const afterPostChange = (threadDeleted) => {
    if (threadDeleted === true) { if (onBack) onBack(); else navigate(thread.category ? `/forum/c/${thread.category.slug}` : '/forum'); return; }
    refresh();
  };

  return (
    <div className="space-y-4">
      {/* Điều hướng */}
      <div className="flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
        {onBack ? (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline"><Icon name="chevronLeft" className="w-4 h-4" />{backLabel}</button>
        ) : (
          <>
            <Link to="/forum" className="hover:text-primary-700">Diễn đàn</Link>
            <Icon name="chevronRight" className="w-3.5 h-3.5 text-slate-300" />
            {thread.category ? <Link to={`/forum/c/${thread.category.slug}`} className="hover:text-primary-700">{thread.category.name}</Link> : <span>Diễn đàn dự án {thread.workspace?.name}</span>}
          </>
        )}
      </div>

      {/* Tiêu đề chủ đề */}
      <div className="card">
        {thread.workspace && !embedded && (
          <p className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold"><Icon name="lock" className="w-3.5 h-3.5" />Diễn đàn riêng của dự án {thread.workspace.name}</p>
        )}
        {editingTitle ? (
          <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); rename.mutate(titleDraft); }}>
            <input className="input-field flex-1 min-w-[12rem]" value={titleDraft} maxLength={200} onChange={(e) => setTitleDraft(e.target.value)} autoFocus />
            <button className="btn-primary text-sm" disabled={rename.isPending}>Lưu</button>
            <button type="button" className="btn-secondary text-sm" onClick={() => setEditingTitle(false)}>Hủy</button>
          </form>
        ) : (
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 break-words">
            <ThreadBadges thread={thread} />
            {thread.title}
          </h1>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span>Bởi {thread.author ? <button type="button" onClick={() => setMemberId(thread.author.id)} className="font-bold text-slate-700 hover:text-primary-700 hover:underline">{thread.author.full_name}</button> : <strong className="text-slate-700">Ẩn danh</strong>}</span>
          <span className="inline-flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5 text-slate-400" />{new Date(thread.created_at).toLocaleString('vi-VN')}</span>
          <StatChip icon="comments" tone="sky" value={`${thread.reply_count} trả lời`} />
          <StatChip icon="eye" tone="violet" value={`${thread.view_count} lượt xem`} />

          <span className="ml-auto flex flex-wrap items-center gap-1.5">
            {thread.can_edit_title && !editingTitle && (
              <button type="button" onClick={() => { setTitleDraft(thread.title); setEditingTitle(true); }} className="px-2.5 py-1 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200">Sửa tiêu đề</button>
            )}
            {thread.can_moderate && (
              <>
                <button type="button" onClick={() => flag.mutate({ kind: 'pin', value: !thread.is_pinned })} disabled={flag.isPending} className="px-2.5 py-1 rounded-lg font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100">{thread.is_pinned ? 'Bỏ ghim' : 'Ghim'}</button>
                <button type="button" onClick={() => flag.mutate({ kind: 'lock', value: !thread.is_locked })} disabled={flag.isPending} className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">{thread.is_locked ? 'Mở khóa' : 'Khóa'}</button>
              </>
            )}
          </span>
        </div>
      </div>

      <Pager page={pagination.page} totalPages={pagination.totalPages} onChange={goPage} />

      <div className="space-y-3">
        {posts.map((p) => <PostCard key={p.id} post={p} thread={thread} canReply={thread.can_reply} onQuote={startQuote} onChanged={afterPostChange} onOpenAuthor={setMemberId} onJump={jumpTo} />)}
      </div>

      <Pager page={pagination.page} totalPages={pagination.totalPages} onChange={goPage} />

      {/* Trả lời */}
      <div ref={composerRef} className="card scroll-mt-24">
        <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2.5"><span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow"><Icon name="comments" className="w-[18px] h-[18px]" /></span>Trả lời chủ đề</h2>
        {!user ? (
          <div className="text-center py-6">
            <p className="text-slate-600">Đăng nhập để tham gia thảo luận.</p>
            <button type="button" className="btn-primary mt-3" onClick={openLoginModal}>Đăng nhập</button>
          </div>
        ) : thread.can_reply ? (
          <Composer
            quote={quote}
            onClearQuote={() => setQuote(null)}
            pending={reply.isPending}
            onSubmit={(content, clear) => reply.mutate({ content, quote_post_id: quote?.id }, { onSuccess: clear })}
          />
        ) : (
          <p className="text-slate-500 text-sm py-2 flex items-center gap-2"><Icon name="lock" className="w-4 h-4" />Chủ đề đã bị khóa, không thể trả lời.</p>
        )}
      </div>
      {memberId && <MemberCard userId={memberId} onClose={() => setMemberId(null)} />}
    </div>
  );
}
