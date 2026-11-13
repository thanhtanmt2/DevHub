import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/api/forumApi';
import { useAuth } from '@/contexts/AuthContext';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ForumThreadView from '@/components/forum/ForumThreadView';
import NewThreadForm from '@/components/forum/NewThreadForm';
import CategoryManager from '@/components/forum/CategoryManager';
import Avatar from '@/components/common/Avatar';
import { CategoryTile, Pager, StatChip, ThreadRow, compactNumber } from '@/components/forum/ForumParts';
import { timeAgo } from '@/utils/timeAgo';

export const Shell = ({ children }) => <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">{children}</div>;

function SearchBox({ defaultValue = '', onSearch, placeholder = 'Tìm chủ đề, nội dung...' }) {
  const [v, setV] = useState(defaultValue);
  return (
    <form className="relative w-full" onSubmit={(e) => { e.preventDefault(); onSearch(v.trim()); }} role="search">
      <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input className="input-field !pl-10 !rounded-xl" placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value)} />
    </form>
  );
}

export function Hero({ title, subtitle, icon, children }) {  // icon: có thì hiện ô bong bóng chat ở đầu banner
  return (
    <div className="rounded-2xl bg-brand-gradient text-white px-4 py-4 sm:px-6 sm:py-5 shadow-lift">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {icon && <CategoryTile variant="tile" size="sm" className="hidden md:flex" />}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/90 line-clamp-2">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">{children}</div>
      </div>
    </div>
  );
}

// ─── /forum — trang chủ diễn đàn (hoặc kết quả tìm kiếm / bài của tôi) ──────────
export function ForumHomePage() {
  const { user, isAdmin, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const mine = params.get('me') === '1';
  const authorId = params.get('author') || ''; // xem các chủ đề công khai của một thành viên
  const page = parseInt(params.get('page'), 10) || 1;
  const [manage, setManage] = useState(false);

  const { data: overview, isLoading } = useQuery({ queryKey: ['forum-overview', user?.id ?? 'guest'], queryFn: () => forumApi.getOverview().then((r) => r.data.data) });
  const searching = !!q || mine || !!authorId;
  const { data: authorInfo } = useQuery({ queryKey: ['forum-member', authorId], queryFn: () => forumApi.getMember(authorId).then((r) => r.data.data), enabled: !!authorId, retry: false });
  const { data: found, isLoading: searchLoading } = useQuery({
    queryKey: ['forum-threads', 'search', q, mine, authorId, page, user?.id ?? 'guest'],
    queryFn: () => forumApi.getThreads({ q: q || undefined, author: mine ? 'me' : authorId || undefined, page }).then((r) => r.data),
    enabled: searching && (!mine || !!user),
  });
  const setQuery = (patch) => setParams((prev) => { const n = new URLSearchParams(prev); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); return n; });
  const newThread = () => (user ? navigate('/forum/new') : openLoginModal());

  return (
    <Shell>
      <Hero title="Diễn đàn DevHub" subtitle="Nơi ứng viên, nhà tuyển dụng và đội ngũ DevHub trao đổi, hỏi đáp và chia sẻ kinh nghiệm.">
        <button type="button" onClick={newThread} className="btn-light"><Icon name="plus" className="w-4 h-4" />Chủ đề mới</button>
        {user && <button type="button" onClick={() => setQuery({ me: mine ? '' : '1', q: '', page: '' })} className="btn-glass">{mine ? 'Xem tất cả' : 'Bài của tôi'}</button>}
        {user && <Link to="/forum/saved" className="btn-glass"><Icon name="bookmark" className="w-4 h-4" />Đã lưu</Link>}
        {user && (
          <Link to="/forum/messages" className="btn-glass">
            <Icon name="mail" className="w-4 h-4" />Tin nhắn
            {overview?.me?.unread_messages > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-white text-primary-700 text-[11px] font-extrabold flex items-center justify-center">{overview.me.unread_messages}</span>}
          </Link>
        )}
        {isAdmin() && (
          <Link to="/forum/reports" className="btn-glass">
            <Icon name="flag" className="w-4 h-4" />Báo cáo
            {overview?.me?.open_reports > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-white text-red-600 text-[11px] font-extrabold flex items-center justify-center">{overview.me.open_reports}</span>}
          </Link>
        )}
      </Hero>

      <SearchBox defaultValue={q} onSearch={(v) => setQuery({ q: v, page: '' })} />

      {searching ? (
        <section className="card !p-0 overflow-hidden">
          <div className="px-5 py-3 border-b bg-slate-50 flex items-center justify-between gap-2">
            <h2 className="font-bold text-slate-900">{authorId ? `Chủ đề của ${authorInfo?.full_name || 'thành viên'}` : mine ? 'Chủ đề của tôi' : `Kết quả cho "${q}"`}{found && <span className="ml-2 text-sm font-medium text-slate-500">({found.pagination.total})</span>}</h2>
            <button type="button" onClick={() => setQuery({ q: '', me: '', author: '', page: '' })} className="text-sm font-semibold text-primary-700 hover:underline">{authorId ? 'Xem tất cả' : 'Xóa tìm kiếm'}</button>
          </div>
          {searchLoading ? <div className="py-10"><LoadingSpinner /></div> : found?.data.length ? (
            <ul className="divide-y divide-slate-100">{found.data.map((t) => <ThreadRow key={t.id} thread={t} />)}</ul>
          ) : <p className="py-12 text-center text-slate-500">{mine && !user ? 'Đăng nhập để xem bài của bạn.' : 'Không có chủ đề nào phù hợp.'}</p>}
          {found && <div className="p-4 border-t"><Pager page={page} totalPages={found.pagination.totalPages} onChange={(n) => setQuery({ page: String(n) })} /></div>}
        </section>
      ) : isLoading ? <LoadingSpinner /> : (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem] gap-5 items-start">
          <div className="space-y-5 min-w-0">
            {/* Chuyên mục */}
            <section className="card !p-0 overflow-hidden">
              <div className="px-5 py-3 border-b bg-slate-50 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Chuyên mục</h2>
                {isAdmin() && <button type="button" onClick={() => setManage(true)} className="text-sm font-semibold text-primary-700 hover:underline">Quản lý chuyên mục</button>}
              </div>
              <ul className="divide-y divide-slate-100">
                {overview.categories.map((c) => (
                  <li key={c.id}>
                    <Link to={`/forum/c/${c.slug}`} className="flex items-center gap-3.5 px-4 sm:px-5 py-2.5 hover:bg-orange-50/50 transition-colors">
                      <CategoryTile />
                      <div className="min-w-0 flex-1">
                        <h3 title={c.description || undefined} className="text-base font-bold text-primary-800 flex flex-wrap items-center gap-x-2 gap-y-1">{c.name}{c.admin_only && <span title="Chỉ quản trị viên được đăng bài" className="inline-flex text-red-500"><Icon name="lock" className="w-3.5 h-3.5" /></span>}</h3>
                        <p className="sm:hidden mt-1 text-xs text-slate-400">{c.thread_count} chủ đề · {c.post_count} bài viết</p>
                      </div>
                      <div className="hidden sm:block text-center w-20 flex-shrink-0">
                        <p className="text-xs text-slate-400">Chủ đề</p>
                        <p className="text-base font-semibold text-slate-800 leading-tight">{compactNumber(c.thread_count)}</p>
                      </div>
                      <div className="hidden sm:block text-center w-20 flex-shrink-0">
                        <p className="text-xs text-slate-400">Bài viết</p>
                        <p className="text-base font-semibold text-slate-800 leading-tight">{compactNumber(c.post_count)}</p>
                      </div>
                      <div className="hidden md:flex items-center gap-3 w-64 flex-shrink-0 min-w-0">
                        {c.last_thread_id ? (
                          <>
                            <Avatar name={c.last_user_name} src={c.last_user_avatar} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate" title={c.last_thread_title}>{c.last_thread_title}</p>
                              <p className="text-xs text-slate-500 truncate">{timeAgo(c.last_post_at)}{c.last_user_name ? ` · ${c.last_user_name}` : ''}</p>
                            </div>
                          </>
                        ) : <p className="text-xs text-slate-400">Chưa có chủ đề</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Chủ đề mới hoạt động */}
            <section className="card !p-0 overflow-hidden">
              <div className="px-5 py-3 border-b bg-slate-50"><h2 className="font-bold text-slate-900">Chủ đề mới hoạt động</h2></div>
              {overview.latest.length ? (
                <ul className="divide-y divide-slate-100">{overview.latest.map((t) => <ThreadRow key={t.id} thread={t} />)}</ul>
              ) : (
                <div className="py-12 text-center">
                  <IconBadge name="comments" tone="blue" size="lg" className="mx-auto" />
                  <p className="mt-3 font-semibold text-slate-800">Diễn đàn chưa có chủ đề nào</p>
                  <button type="button" onClick={newThread} className="btn-primary mt-4">Mở chủ đề đầu tiên</button>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="card">
              <h2 className="font-bold text-slate-900 mb-3">Thống kê</h2>
              <dl className="grid grid-cols-3 lg:grid-cols-1 gap-3 text-sm">
                {[['Chủ đề', overview.stats.threads, 'list', 'amber'], ['Bài viết', overview.stats.posts, 'document', 'indigo'], ['Thành viên tham gia', overview.stats.members, 'users', 'emerald']].map(([l, v, ic, tone]) => (
                  <div key={l} className="flex lg:items-center lg:justify-between flex-col lg:flex-row gap-1"><dt className="text-slate-500">{l}</dt><dd><StatChip icon={ic} tone={tone} value={v} /></dd></div>
                ))}
              </dl>
            </section>
            <section className="card">
              <h2 className="font-bold text-slate-900 mb-2">Nội quy ngắn gọn</h2>
              <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Tôn trọng mọi người, không công kích cá nhân.</li>
                <li>Không đăng nội dung quảng cáo, lừa đảo hoặc vi phạm pháp luật.</li>
                <li>Đặt tiêu đề rõ ràng và đăng đúng chuyên mục.</li>
                <li>Không chia sẻ thông tin cá nhân của người khác.</li>
              </ul>
            </section>
          </aside>
        </div>
      )}
      {manage && overview && <CategoryManager categories={overview.categories} onClose={() => setManage(false)} />}
    </Shell>
  );
}

// ─── /forum/c/:slug — danh sách chủ đề của một chuyên mục ───────────────────────
const SORTS = [{ v: 'latest', l: 'Mới hoạt động' }, { v: 'new', l: 'Mới nhất' }, { v: 'hot', l: 'Nổi bật' }];
export function ForumCategoryPage() {
  const { slug } = useParams();
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const sort = params.get('sort') || 'latest';
  const q = params.get('q') || '';
  const page = parseInt(params.get('page'), 10) || 1;
  const setQuery = (patch) => setParams((prev) => { const n = new URLSearchParams(prev); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); return n; });

  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-threads', 'category', slug, sort, q, page, user?.id ?? 'guest'],
    queryFn: () => forumApi.getThreads({ category: slug, sort, q: q || undefined, page }).then((r) => r.data),
    retry: false,
  });

  if (isLoading) return <Shell><LoadingSpinner /></Shell>;
  if (error || !data) return (
    <Shell><div className="card text-center py-14"><IconBadge name="search" size="lg" className="mx-auto" /><p className="mt-3 font-semibold text-slate-800">Không tìm thấy chuyên mục</p><Link to="/forum" className="btn-primary mt-4 inline-flex">Về diễn đàn</Link></div></Shell>
  );
  const { category, permissions } = data;

  return (
    <Shell>
      <div className="flex items-center gap-2 text-sm text-slate-500"><Link to="/forum" className="hover:text-primary-700">Diễn đàn</Link><Icon name="chevronRight" className="w-3.5 h-3.5 text-slate-300" /><span className="text-slate-700 font-medium">{category.name}</span></div>
      <Hero title={category.name} subtitle={category.description} icon={category.icon}>
        {permissions.can_post ? (
          <button type="button" onClick={() => navigate(`/forum/new?category=${category.slug}`)} className="btn-light"><Icon name="plus" className="w-4 h-4" />Chủ đề mới</button>
        ) : !user ? (
          <button type="button" onClick={openLoginModal} className="btn-light">Đăng nhập để đăng bài</button>
        ) : <span className="text-sm text-white/90 inline-flex items-center gap-1.5"><Icon name="lock" className="w-4 h-4" />Chỉ quản trị viên được đăng bài</span>}
      </Hero>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist">
          {SORTS.map((s) => (
            <button key={s.v} type="button" role="tab" aria-selected={sort === s.v} onClick={() => setQuery({ sort: s.v === 'latest' ? '' : s.v, page: '' })}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${sort === s.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700'}`}>{s.l}</button>
          ))}
        </div>
        <div className="sm:ml-auto sm:w-72"><SearchBox defaultValue={q} onSearch={(v) => setQuery({ q: v, page: '' })} placeholder="Tìm trong chuyên mục..." /></div>
      </div>

      <Pager page={page} totalPages={data.pagination.totalPages} onChange={(n) => setQuery({ page: String(n) })} />
      <section className="card !p-0 overflow-hidden">
        {data.data.length ? (
          <ul className="divide-y divide-slate-100">{data.data.map((t) => <ThreadRow key={t.id} thread={t} showCategory={false} />)}</ul>
        ) : (
          <div className="py-14 text-center">
            <IconBadge name="comments" tone="blue" size="lg" className="mx-auto" />
            <p className="mt-3 font-semibold text-slate-800">{q ? 'Không có chủ đề nào phù hợp' : 'Chuyên mục chưa có chủ đề nào'}</p>
            {permissions.can_post && !q && <button type="button" onClick={() => navigate(`/forum/new?category=${category.slug}`)} className="btn-primary mt-4">Mở chủ đề đầu tiên</button>}
          </div>
        )}
      </section>
      <Pager page={page} totalPages={data.pagination.totalPages} onChange={(n) => { setQuery({ page: String(n) }); window.scrollTo({ top: 0 }); }} />
    </Shell>
  );
}

// ─── /forum/t/:id — một chủ đề ──────────────────────────────────────────────────
export function ForumThreadPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  return <Shell><ForumThreadView threadId={id} jumpToPost={params.get('post')} initialPage={parseInt(params.get('page'), 10) || 1} /></Shell>;
}

// ─── /forum/new — mở chủ đề mới ────────────────────────────────────────────────
export function ForumNewThreadPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data, isLoading } = useQuery({ queryKey: ['forum-overview'], queryFn: () => forumApi.getOverview().then((r) => r.data.data) });
  if (isLoading) return <Shell><LoadingSpinner /></Shell>;
  const categories = data.categories.filter((c) => !c.admin_only || isAdmin());
  const preset = categories.find((c) => c.slug === params.get('category'));
  return (
    <Shell>
      <div className="flex items-center gap-2 text-sm text-slate-500"><Link to="/forum" className="hover:text-primary-700">Diễn đàn</Link><Icon name="chevronRight" className="w-3.5 h-3.5 text-slate-300" /><span className="text-slate-700 font-medium">Chủ đề mới</span></div>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Mở chủ đề mới</h1>
      <div className="max-w-3xl">
        <NewThreadForm categories={categories} defaultCategoryId={preset?.id} onCreated={(id) => navigate(`/forum/t/${id}`)} onCancel={() => navigate(-1)} />
      </div>
    </Shell>
  );
}
