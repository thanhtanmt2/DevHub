import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi } from '@/api/notificationApi';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import Logo from '@/components/common/Logo';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { stripEmoji } from '@/utils/stripEmoji';
import { SUPPORT, telHref, mailHref } from '@/config/support';

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const ref = useRef(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
    refetchInterval: 15000, // hỏi lại mỗi 15 giây
    refetchOnWindowFocus: true, // và ngay khi quay lại tab
  });
  const notifications = data?.data?.data || [];
  const unread = data?.data?.unreadCount || 0;

  const markReadMut = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markAllMut = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('Đã đọc tất cả'); },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Icon + màu hiển thị theo LOẠI thông báo (cột bên trái)
  const NOTIF_ICONS = {
    TASK_ASSIGNED: { name: 'clipboard', tone: 'blue' },
    TASK_STATUS_CHANGED: { name: 'refresh', tone: 'gray' },
    TASK_APPROVED: { name: 'verified', tone: 'green' },
    TASK_REVISION: { name: 'undo', tone: 'amber' },
    TASK_COMMENT: { name: 'chat', tone: 'blue' },
    TASK_DEADLINE_SOON: { name: 'alert', tone: 'amber' },
    MEMBER_ADDED: { name: 'user', tone: 'blue' },
    MEMBER_ROLE_CHANGED: { name: 'lock', tone: 'gray' },
    PROJECT_UPDATE: { name: 'pencil', tone: 'gray' }, // task được cập nhật / bị xóa
    INTERVIEW_SCHEDULED: { name: 'calendar', tone: 'blue' },
    APPLICATION_STATUS: { name: 'clipboard', tone: 'blue' },
    APPLICATION_SUBMITTED: { name: 'inbox', tone: 'blue' },
    APPLICATION_WITHDRAWN: { name: 'undo', tone: 'amber' },
    PROJECT_APPLICATION: { name: 'inbox', tone: 'blue' },
    JOB_PENDING: { name: 'clock', tone: 'amber' },
    JOB_APPROVED: { name: 'verified', tone: 'green' },
    JOB_REJECTED: { name: 'xCircle', tone: 'red' },
    COMPANY_PENDING: { name: 'building', tone: 'amber' },
    COMPANY_VERIFIED: { name: 'verified', tone: 'green' },
    COMPANY_REJECTED: { name: 'xCircle', tone: 'red' },
    PAYMENT_UPDATE: { name: 'cash', tone: 'green' },
  };
  const notifIcon = (type, size) => {
    const i = NOTIF_ICONS[type] || { name: 'bell', tone: 'gray' };
    return <IconBadge name={i.name} tone={i.tone} size={size} />;
  };

  // Tiêu đề thông báo từ server có sẵn emoji ở đầu (vd: "[emoji] Bạn được giao task mới"); icon đã hiện ở cột trái
  // nên bỏ emoji đầu tiêu đề để khỏi hiện 2 hình giống nhau (áp dụng cho cả thông báo cũ trong database)
  const cleanTitle = (title) => (title || '').replace(/^[^\p{L}\p{N}]+/u, '').trim() || title;

  return (
    // Trên điện thoại danh sách thông báo trải gần hết chiều ngang màn hình (định vị theo thanh Navbar),
    // từ sm trở lên thì thả xuống ngay dưới chuông
    <div className="sm:relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) refetch(); }}
        className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-primary-700 transition-colors"
        aria-label="Thông báo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-3 sm:inset-x-auto sm:right-0 top-full mt-2 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <p className="font-bold text-gray-800 text-sm">Thông báo {unread > 0 && <span className="text-primary-700">({unread} mới)</span>}</p>
            {unread > 0 && (
              <button onClick={() => markAllMut.mutate()} className="text-xs text-primary-700 hover:underline">
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <IconBadge name="bell" size="md" className="mx-auto mb-2" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-primary-50/50' : ''}`}
                onClick={() => { 
                  if (!n.is_read) markReadMut.mutate(n.id); 
                  setSelectedNotif(n);
                  setOpen(false);
                }}
              >
                {notifIcon(n.type, 'sm')}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{cleanTitle(n.title)}</p>
                  {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 break-words">{stripEmoji(n.message)}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.createdAt || n.created_at).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                {!n.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Detail Modal — render ra body (portal) để không bị kẹt trong Navbar (backdrop-blur tạo khung chứa riêng cho phần tử fixed) */}
      {selectedNotif && createPortal(
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
            <div className="bg-primary-50 p-4 border-b border-primary-100 flex items-start gap-3">
              {notifIcon(selectedNotif.type, 'md')}
              <div className="flex-1">
                <h3 className="font-bold text-primary-900 leading-tight">{cleanTitle(selectedNotif.title)}</h3>
                <p className="text-xs text-primary-700 mt-1">
                  {new Date(selectedNotif.createdAt || selectedNotif.created_at).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="p-5">
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {stripEmoji(selectedNotif.message) || 'Không có nội dung chi tiết.'}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedNotif(null)} 
                  className="btn-secondary"
                >
                  Đóng
                </button>
                {selectedNotif.link && (
                  <button 
                    onClick={() => {
                      setSelectedNotif(null);
                      navigate(selectedNotif.link);
                    }}
                    className="btn-primary"
                  >
                    Đi đến liên kết ↗
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Menu tài khoản (ảnh đại diện) ────────────────────────────────────────────
// Chỉ liên kết tới các trang đã có. Mỗi vai trò có nhóm mục riêng + nhóm "Tài khoản & bảo mật" dùng chung.
const CANDIDATE_MENU = [
  { label: 'Hồ sơ & tìm việc', items: [
    { to: '/candidate', icon: 'home', text: 'Tổng quan', end: true },
    { to: '/candidate/profile', icon: 'user', text: 'Hồ sơ năng lực' },
    { to: '/candidate/profile?tab=cv', icon: 'document', text: 'CV của tôi' },
    { to: '/candidate/profile?tab=skills', icon: 'skills', text: 'Kỹ năng & kinh nghiệm' },
    { to: '/candidate/applications', icon: 'clipboard', text: 'Hồ sơ ứng tuyển' },
    { to: '/candidate/saved', icon: 'heart', text: 'Việc làm đã lưu' },
    { to: '/candidate/workspaces', icon: 'workspace', text: 'Dự án của tôi' },
    { to: '/jobs', icon: 'sparkles', text: 'Việc làm phù hợp với bạn' },
    { to: '/candidate/profile?tab=payment', icon: 'cash', text: 'Nhận thù lao' },
  ] },
];
const EMPLOYER_MENU = [
  { label: 'Tuyển dụng', items: [
    { to: '/employer', icon: 'home', text: 'Tổng quan', end: true },
    { to: '/employer/company', icon: 'building', text: 'Hồ sơ công ty' },
    { to: '/employer/jobs', icon: 'briefcase', text: 'Tin tuyển dụng' },
    { to: '/employer/candidates', icon: 'search', text: 'Tìm ứng viên' },
  ] },
];
const ADMIN_MENU = [
  { label: 'Quản trị hệ thống', items: [
    { to: '/admin', icon: 'home', text: 'Tổng quan', end: true },
    { to: '/admin/users', icon: 'users', text: 'Người dùng' },
    { to: '/admin/jobs', icon: 'briefcase', text: 'Duyệt tin tuyển dụng' },
    { to: '/admin/payments', icon: 'card', text: 'Thanh toán' },
    { to: '/admin/stats', icon: 'chart', text: 'Thống kê' },
    { to: '/admin/logs', icon: 'history', text: 'Nhật ký hệ thống' },
  ] },
];
// Nhóm "Tài khoản & bảo mật" dùng chung; mỗi mục mở đúng tab trong trang /account
const accountMenu = (user, candidate) => ({
  label: 'Tài khoản & bảo mật',
  items: [
    { to: '/account', icon: 'user', text: 'Thông tin cá nhân' },
    { to: '/account?tab=password', icon: 'lock', text: 'Đổi mật khẩu' },
    { to: '/account?tab=twofa', icon: 'shield', text: 'Xác minh 2 bước', hint: user?.two_factor_enabled ? 'Đã bật' : 'Chưa kích hoạt' },
    { to: '/account?tab=devices', icon: 'laptop', text: 'Thiết bị đăng nhập' },
    ...(candidate ? [{ to: '/candidate/profile', icon: 'eye', text: 'Quyền riêng tư hồ sơ', hint: 'Chọn thông tin nhà tuyển dụng được xem' }] : []),
    { href: mailHref(SUPPORT.email), icon: 'headset', text: 'Trợ giúp & hỗ trợ' },
  ],
});

function UserMenu({ user, roleLabel, groups, candidate, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(null);
  const lastPointer = useRef('mouse');
  const { pathname, search } = useLocation();
  const displayName = user?.full_name || user?.email || '';

  const cancelClose = () => { clearTimeout(closeTimer.current); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 160); };

  // Đổi trang thì đóng; bấm ra ngoài hoặc Esc cũng đóng
  useEffect(() => { setOpen(false); }, [pathname, search]);
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); clearTimeout(closeTimer.current); };
  }, []);

  const itemCls = 'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors';
  const renderItem = (it) => {
    const inner = (
      <>
        <Icon name={it.icon} className="w-[18px] h-[18px] text-slate-400 group-hover:text-primary-600 flex-shrink-0" />
        <span className="flex-1 min-w-0">
          <span className="block truncate">{it.text}</span>
          {it.hint && <span className="block text-[11px] font-normal text-slate-400 truncate">{it.hint}</span>}
        </span>
      </>
    );
    return it.href
      ? <a key={it.text} href={it.href} className={itemCls} role="menuitem">{inner}</a>
      : <Link key={it.text} to={it.to} className={itemCls} role="menuitem">{inner}</Link>;
  };

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => { lastPointer.current = e.pointerType; if (e.pointerType === 'mouse') { cancelClose(); setOpen(true); } }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') scheduleClose(); }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => (lastPointer.current === 'mouse' ? true : !o))}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu tài khoản"
        className="flex items-center gap-1 rounded-full p-0.5 pr-1 hover:bg-slate-50 transition-colors"
      >
        <Avatar name={displayName} src={user?.avatar_url} size="sm" className="ring-2 ring-primary-200" />
        <Icon name="chevronDown" className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        // pt-2 (không dùng margin) để con trỏ đi từ ảnh xuống menu không bị "hở" làm menu đóng giữa chừng
        <div className="absolute right-0 top-full pt-2 z-50 animate-fade-in">
          <div role="menu" className="w-80 max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain bg-white rounded-2xl border border-slate-200 shadow-xl">
            {/* Thông tin tài khoản */}
            <Link to="/account" className="flex items-center gap-3 px-4 py-4 bg-primary-50/70 border-b border-primary-100 rounded-t-2xl hover:bg-primary-50 transition-colors">
              <Avatar name={displayName} src={user?.avatar_url} size="xl" className="ring-2 ring-white" />
              <span className="min-w-0 flex-1">
                {/* Tên hiện đầy đủ (dài thì xuống dòng); nhãn vai trò đi liền sau tên, hết chỗ mới xuống dòng dưới */}
                <span className="block font-bold text-slate-900 leading-snug break-words">
                  {displayName}
                  <span className="inline-block align-middle ml-2 px-2.5 py-0.5 rounded-full bg-primary-600 text-white text-[11px] font-bold leading-4">{roleLabel}</span>
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-slate-500 min-w-0">
                  <span className="truncate">{user?.email}</span>
                  {user?.email_verified && <span title="Email đã xác thực" className="flex-shrink-0"><Icon name="verified" className="w-3.5 h-3.5 text-emerald-600" /></span>}
                </span>
              </span>
            </Link>

            <div className="p-2">
              {[...groups, accountMenu(user, candidate)].map((g, i) => (
                <div key={g.label} className={i > 0 ? 'mt-1 pt-1 border-t border-slate-100' : ''}>
                  <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{g.label}</p>
                  {g.items.map(renderItem)}
                </div>
              ))}
              <div className="mt-1 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Icon name="logout" className="w-[18px] h-[18px] flex-shrink-0" />Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Thanh liên hệ (nền màu thương hiệu, chỉ trang công khai, từ md trở lên) + header trắng cố định phía trên.
function TopBar() {
  return (
    <div className="hidden md:block bg-primary-600 text-white text-[13px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6 min-w-0">
          <a href={mailHref(SUPPORT.email)} className="inline-flex items-center gap-2 min-w-0 hover:underline">
            <Icon name="mail" className="w-4 h-4" /><span className="truncate">{SUPPORT.email}</span>
          </a>
          <a href={telHref(SUPPORT.hotline)} className="inline-flex items-center gap-2 whitespace-nowrap hover:underline">
            <Icon name="phone" className="w-4 h-4" />Hotline: {SUPPORT.hotline}
          </a>
        </div>
        <p className="hidden lg:inline-flex items-center gap-2 whitespace-nowrap">
          <Icon name="clock" className="w-4 h-4" />{SUPPORT.hours}
        </p>
      </div>
    </div>
  );
}

// Liên kết chính: chữ đậm, mục đang mở có gạch chân màu thương hiệu sát mép dưới header
const navLinkClass = ({ isActive }) =>
  `relative inline-flex items-center h-full px-3.5 text-[15px] font-semibold whitespace-nowrap transition-colors ${
    isActive
      ? "text-primary-700 after:content-[''] after:absolute after:left-3.5 after:right-3.5 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-primary-600"
      : 'text-slate-700 hover:text-primary-700'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
  }`;

// topBar: hiện thanh liên hệ phía trên header (dùng ở các trang công khai; trang quản trị / dashboard để gọn thì tắt)
export default function Navbar({ topBar = false }) {
  const { user, logout, isAdmin, isCandidate, isEmployer, openLoginModal, openRegisterModal } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false); // menu thu gọn trên điện thoại

  // Đổi trang thì đóng menu
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    const isConfirmed = await confirm({ title: 'Đăng xuất', message: 'Bạn có chắc chắn muốn đăng xuất không?', confirmText: 'Đăng xuất' });
    if (!isConfirmed) return;

    await logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin';
    if (isCandidate()) return '/candidate';
    if (isEmployer()) return '/employer';
    return '/';
  };

  const displayName = user?.full_name || user?.email || '';
  // Ứng viên có trang hồ sơ năng lực riêng; Nhà tuyển dụng / Admin dùng trang tài khoản chung
  const profileLink = isCandidate() ? '/candidate/profile' : '/account';

  const burger = (
    <button
      type="button"
      onClick={() => setMenuOpen((o) => !o)}
      className="md:hidden p-2 -mr-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
      aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
      aria-expanded={menuOpen}
    >
      <Icon name={menuOpen ? 'x' : 'menu'} />
    </button>
  );

  return (
    <>
      {topBar && <TopBar />}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-[0_2px_14px_rgba(8,71,79,0.07)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            <div className="flex items-center gap-4 lg:gap-10 min-w-0 h-full">
              <Logo variant="dark" />
              {/* Điều hướng chính nằm cạnh logo (từ màn hình vừa trở lên) */}
              <div className="hidden md:flex items-center h-full">
                <NavLink to="/" end className={navLinkClass}>Trang chủ</NavLink>
                <NavLink to="/jobs" className={navLinkClass}>Việc làm</NavLink>
                <NavLink to="/projects" className={navLinkClass}>Dự án thời vụ</NavLink>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="hidden md:inline px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-primary-700 hover:bg-slate-50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <NotificationBell />
                  <div className="flex items-center gap-2 pl-2 ml-1 border-l border-slate-200">
                    <UserMenu
                      user={user}
                      roleLabel={isAdmin() ? 'Quản trị viên' : isEmployer() ? 'Nhà tuyển dụng' : 'Ứng viên'}
                      groups={isAdmin() ? ADMIN_MENU : isEmployer() ? EMPLOYER_MENU : CANDIDATE_MENU}
                      candidate={isCandidate()}
                      onLogout={handleLogout}
                    />
                    {burger}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openRegisterModal('EMPLOYER')}
                    className="hidden lg:inline-flex px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-primary-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Dành cho nhà tuyển dụng
                  </button>
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap text-primary-700 border border-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => openRegisterModal()}
                    className="hidden sm:inline-flex btn-primary text-sm whitespace-nowrap"
                  >
                    Đăng ký
                  </button>
                  {burger}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu thu gọn (chỉ điện thoại) */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
            {user && <p className="px-3 pb-2 text-xs text-slate-500 truncate">{displayName}</p>}
            <NavLink to="/" end className={mobileLinkClass}>Trang chủ</NavLink>
            <NavLink to="/jobs" className={mobileLinkClass}>Việc làm</NavLink>
            <NavLink to="/projects" className={mobileLinkClass}>Dự án thời vụ</NavLink>
            {user ? (
              <>
                <NavLink to={profileLink} className={mobileLinkClass}>Hồ sơ cá nhân</NavLink>
                {isCandidate() && <NavLink to="/candidate/saved" className={mobileLinkClass}>Việc làm đã lưu</NavLink>}
                <NavLink to={getDashboardLink()} end className={mobileLinkClass}>Dashboard</NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); openRegisterModal(); }}
                  className={mobileLinkClass({ isActive: false })}
                >
                  Đăng ký tài khoản
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); openRegisterModal('EMPLOYER'); }}
                  className={mobileLinkClass({ isActive: false })}
                >
                  Dành cho nhà tuyển dụng
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
