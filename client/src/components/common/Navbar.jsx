import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi } from '@/api/notificationApi';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { stripEmoji } from '@/utils/stripEmoji';

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
    refetchInterval: 30000, // poll every 30s
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
        className="relative p-2 rounded-full text-white hover:bg-white/15 transition-colors"
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
            <p className="font-bold text-gray-800 text-sm">Thông báo {unread > 0 && <span className="text-primary-600">({unread} mới)</span>}</p>
            {unread > 0 && (
              <button onClick={() => markAllMut.mutate()} className="text-xs text-primary-600 hover:underline">
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
                className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
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
                {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
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
                <p className="text-xs text-primary-600 mt-1">
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

// ─── Navbar ───────────────────────────────────────────────────────────────────
const navLinkClass = ({ isActive }) =>
  `px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
    isActive ? 'bg-white/20 text-white' : 'text-white hover:text-white hover:bg-white/10'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
  }`;

export default function Navbar() {
  const { user, logout, isAdmin, isCandidate, isEmployer, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false); // menu thu gọn trên điện thoại (khi đã đăng nhập)

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

  return (
    <nav className="sticky top-0 z-30 bg-primary-600 text-white shadow-md shadow-primary-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-xl bg-white text-primary-700 flex items-center justify-center font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              D
            </span>
            <span className="text-xl font-bold text-white tracking-tight">
              DevHub
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Chưa đăng nhập: luôn hiện 2 liên kết. Đã đăng nhập: điện thoại dùng menu thu gọn để không bị tràn ngang */}
            <div className={`${user ? 'hidden sm:flex' : 'flex'} items-center gap-1 sm:gap-2`}>
              <NavLink to="/projects" className={navLinkClass}>
                <span className="hidden sm:inline">Dự án thời vụ</span>
                <span className="sm:hidden">Dự án</span>
              </NavLink>
              <NavLink to="/jobs" className={navLinkClass}>
                <span className="hidden sm:inline">Tuyển dụng công ty</span>
                <span className="sm:hidden">Việc làm</span>
              </NavLink>
            </div>
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="hidden sm:inline px-3 py-2 rounded-lg text-sm font-semibold text-white hover:text-white hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </Link>
                {/* Notification Bell */}
                <NotificationBell />
                <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/25">
                  <span title={displayName}><Avatar name={displayName} size="sm" className="ring-2 ring-white/70" /></span>
                  <button onClick={handleLogout} className="hidden sm:inline-flex btn-glass text-sm !py-1.5">
                    Đăng xuất
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="sm:hidden p-2 -mr-2 rounded-lg text-white hover:bg-white/15 transition-colors"
                    aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                    aria-expanded={menuOpen}
                  >
                    <Icon name={menuOpen ? 'x' : 'menu'} />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="btn-light text-sm ml-1 sm:ml-2 whitespace-nowrap"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu thu gọn (chỉ điện thoại, khi đã đăng nhập) */}
      {user && menuOpen && (
        <div className="sm:hidden border-t border-white/15 bg-primary-600 px-4 py-3 space-y-1 animate-fade-in">
          <p className="px-3 pb-2 text-xs text-white truncate">{displayName}</p>
          <NavLink to="/projects" className={mobileLinkClass}>Dự án thời vụ</NavLink>
          <NavLink to="/jobs" className={mobileLinkClass}>Tuyển dụng công ty</NavLink>
          <NavLink to={getDashboardLink()} end className={mobileLinkClass}>Dashboard</NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-200 hover:bg-white/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </nav>
  );
}
