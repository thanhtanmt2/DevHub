import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi } from '@/api/notificationApi';
import toast from 'react-hot-toast';

// ─── Notification Bell ────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
    refetchInterval: 30000, // poll every 30s
  });
  const notifications = data?.data?.data || [];
  const unread = data?.data?.unreadCount || 0;

  const markReadMut = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });
  const markAllMut = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => { qc.invalidateQueries(['notifications']); toast.success('Đã đọc tất cả'); },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const NOTIF_ICONS = {
    TASK_ASSIGNED: '📌',
    TASK_STATUS_CHANGED: '🔄',
    TASK_APPROVED: '✅',
    TASK_REVISION: '↩️',
    TASK_COMMENT: '💬',
    TASK_DEADLINE_SOON: '⚠️',
    MEMBER_ADDED: '👤',
    MEMBER_ROLE_CHANGED: '🔐',
    PROJECT_UPDATE: '📁',
    INTERVIEW_SCHEDULED: '📅',
    APPLICATION_STATUS: '📋',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) refetch(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
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
                <p className="text-2xl mb-1">🔔</p>
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                onClick={() => { if (!n.is_read) markReadMut.mutate(n.id); setOpen(false); if (n.link) window.location.href = n.link; }}
              >
                <div className="text-lg flex-shrink-0 mt-0.5">{NOTIF_ICONS[n.type] || '📣'}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                  {n.message && <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout, isAdmin, isCandidate, isEmployer, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
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

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            DevHub
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/projects" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Dự án thời vụ
            </Link>
            <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Tuyển dụng công ty
            </Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                {/* Notification Bell */}
                <NotificationBell />
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="btn-primary text-sm"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
