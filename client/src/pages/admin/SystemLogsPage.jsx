import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { logApi } from '@/api/logApi';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import { stripEmoji } from '@/utils/stripEmoji';

const ACTION_LABELS = {
  // Tài khoản
  USER_REGISTER: { text: 'Đăng ký mới', color: 'bg-green-100 text-green-700' },
  USER_LOGIN: { text: 'Đăng nhập', color: 'bg-primary-100 text-primary-700' },
  USER_LOGOUT: { text: 'Đăng xuất', color: 'bg-gray-100 text-gray-700' },
  PASSWORD_CHANGED: { text: 'Đổi mật khẩu', color: 'bg-amber-100 text-amber-700' },
  USER_STATUS_CHANGED: { text: 'Đổi trạng thái TK', color: 'bg-amber-100 text-amber-700' },

  // Công việc (Task)
  TASK_CREATED: { text: 'Tạo Task', color: 'bg-primary-100 text-primary-700' },
  TASK_UPDATED: { text: 'Cập nhật Task', color: 'bg-primary-50 text-primary-700' },
  TASK_STATUS_CHANGED: { text: 'Đổi TT Task', color: 'bg-sky-100 text-sky-700' },
  TASK_DELETED: { text: 'Xóa Task', color: 'bg-red-100 text-red-700' },
  TASK_APPROVED: { text: 'Duyệt Task', color: 'bg-emerald-100 text-emerald-700' },
  TASK_REVISION_REQUESTED: { text: 'Yêu cầu sửa', color: 'bg-orange-100 text-orange-700' },
  TASK_COMMENTED: { text: 'Bình luận', color: 'bg-primary-50 text-primary-700' },
  SUBTASK_ADDED: { text: 'Thêm việc con', color: 'bg-primary-50 text-primary-700' },
  SUBTASK_TOGGLED: { text: 'Tick việc con', color: 'bg-primary-50 text-primary-700' },

  // Workspace
  WORKSPACE_MEMBER_ADDED: { text: 'Thêm Member', color: 'bg-emerald-50 text-emerald-600' },
  WORKSPACE_MEMBER_REMOVED: { text: 'Xóa Member', color: 'bg-red-50 text-red-600' },
  WORKSPACE_MEMBER_ROLE_CHANGED: { text: 'Đổi Vai trò', color: 'bg-amber-100 text-amber-700' },

  // Dự án
  PROJECT_CREATED: { text: 'Tạo Dự án', color: 'bg-primary-100 text-primary-700' },
  PROJECT_UPDATED: { text: 'Cập nhật Dự án', color: 'bg-primary-50 text-primary-700' },
  PROJECT_MANAGER_ASSIGNED: { text: 'Phân công PM', color: 'bg-sky-100 text-sky-700' },
  PROJECT_CLOSED: { text: 'Đóng Dự án', color: 'bg-gray-100 text-gray-700' },

  // Ứng tuyển
  APPLICATION_SUBMITTED: { text: 'Nộp đơn', color: 'bg-sky-100 text-sky-700' },
  APPLICATION_STATUS_CHANGED: { text: 'Cập nhật đơn', color: 'bg-sky-50 text-sky-600' },
  INTERVIEW_SCHEDULED: { text: 'Xếp lịch PV', color: 'bg-sky-100 text-sky-700' },

  // Thanh toán
  PAYMENT_CREATED: { text: 'Tạo khoản thanh toán', color: 'bg-primary-100 text-primary-700' },
  PAYMENT_PROCESSED: { text: 'Cập nhật thanh toán', color: 'bg-primary-200 text-primary-800' },

  // Đánh giá
  MEMBER_EVALUATED: { text: 'Đánh giá', color: 'bg-yellow-100 text-yellow-700' },
};

const ENTITY_TYPES = {
  task: 'Công việc (Task)',
  workspace_member: 'Thành viên Workspace',
  project: 'Dự án',
  project_application: 'Đơn ứng tuyển',
  payment: 'Thanh toán',
  evaluation: 'Đánh giá',
  user: 'Người dùng',
};

const ROLE_LABELS = { ADMIN: 'Quản trị viên', CANDIDATE: 'Ứng viên', EMPLOYER: 'Nhà tuyển dụng' };

const META_LABELS = {
  project_id: 'Mã dự án', workspace_id: 'Mã workspace', workspace_member_id: 'Mã thành viên', task_id: 'Mã task',
  application_id: 'Mã đơn ứng tuyển', payment_id: 'Mã thanh toán', user_id: 'Mã người dùng', job_id: 'Mã tin tuyển dụng',
};

const actionMeta = (action) => ACTION_LABELS[action] || { text: action, color: 'bg-gray-100 text-gray-700' };
const logTime = (log) => new Date(log.createdAt || log.created_at);
const fullTime = (log) => logTime(log).toLocaleString('vi-VN');

// Rút gọn chuỗi User-Agent thành "Chrome trên Windows"
function readDevice(ua) {
  if (!ua) return '';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : null;
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : null;
  return [browser, os].filter(Boolean).join(' trên ') || ua.slice(0, 80);
}

const metaEntries = (metadata) => Object.entries(metadata && typeof metadata === 'object' ? metadata : {})
  .filter(([, v]) => v !== null && v !== undefined && v !== '')
  .map(([k, v]) => ({ key: k, label: META_LABELS[k] || k.replace(/_/g, ' '), value: typeof v === 'object' ? JSON.stringify(v) : String(v) }));

const ActionChip = ({ action }) => {
  const m = actionMeta(action);
  return <span className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${m.color}`}>{m.text}</span>;
};

const RoleChip = ({ role }) => (role ? <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.6875rem] font-medium text-gray-500">{ROLE_LABELS[role] || role}</span> : null);

// Ô chọn người thực hiện, có ô tìm theo tên / email
function UserSearchSelect({ users, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const selected = users.find((u) => u.id === value);
  const needle = search.toLowerCase();
  const filtered = users.filter((u) => (u.full_name || '').toLowerCase().includes(needle) || (u.email || '').toLowerCase().includes(needle));
  const pick = (id) => { onChange(id); setIsOpen(false); setSearch(''); };

  return (
    <div className="relative" ref={containerRef} onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}>
      <button type="button" onClick={() => setIsOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={isOpen}
        className="input-field flex w-full items-center justify-between gap-2 !py-2 text-left text-sm">
        <span className={`truncate ${selected ? 'text-gray-900' : 'text-gray-500'}`}>{selected ? selected.full_name : 'Người thực hiện (Tất cả)'}</span>
        <Icon name="chevronDown" className="h-4 w-4 flex-shrink-0 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-1 flex max-h-64 w-full min-w-[15rem] flex-col rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input autoFocus type="text" className="input-field !py-1.5 text-sm" placeholder="Tìm tên hoặc email..." aria-label="Tìm người thực hiện" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto py-1" role="listbox">
            <button type="button" role="option" aria-selected={!value} onClick={() => pick('')}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${!value ? 'bg-primary-50 font-medium text-primary-700' : 'text-gray-700'}`}>Tất cả người thực hiện</button>
            {filtered.map((u) => (
              <button type="button" key={u.id} role="option" aria-selected={value === u.id} onClick={() => pick(u.id)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${value === u.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>
                <span className="block font-medium">{u.full_name}</span>
                <span className="block truncate text-xs opacity-70">{u.email}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-3 text-center text-sm text-gray-500">Không tìm thấy</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Một ô "nhãn nhỏ + giá trị" trong phần chi tiết
const Tile = ({ label, children, wide = false }) => (
  <div className={`rounded-xl border border-gray-100 bg-white p-3 ${wide ? 'sm:col-span-2' : ''}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <div className="mt-0.5 break-words text-sm font-semibold leading-snug text-gray-900">{children}</div>
  </div>
);

// Phần chi tiết mở ra ngay bên dưới dòng khi bấm vào
function LogDetail({ log, onCopy }) {
  const extras = metaEntries(log.metadata);
  const device = readDevice(log.user_agent);
  const description = stripEmoji(log.description);
  return (
    <div id={`log-detail-${log.id}`} role="region" aria-label="Chi tiết hoạt động" className="grid animate-expand">
      <div className="min-h-0 overflow-hidden">
        <div className="space-y-4 border-t border-primary-100 bg-gray-50/80 px-4 py-4 sm:px-5">
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Nội dung</h3>
            <p className="whitespace-pre-line break-words rounded-xl border border-gray-100 bg-white p-3.5 text-sm leading-relaxed text-gray-700">{description || 'Không có mô tả.'}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Thời gian">{fullTime(log)}</Tile>
            <Tile label="Người thực hiện">
              <span>{log.user_name || 'Hệ thống'}</span>
              {log.user_role && <span className="mt-1 block text-xs font-medium text-gray-500">{ROLE_LABELS[log.user_role] || log.user_role}</span>}
            </Tile>
            {log.entity_type && <Tile label="Loại đối tượng">{ENTITY_TYPES[log.entity_type] || log.entity_type}</Tile>}
            {log.ip_address && <Tile label="Địa chỉ IP">{log.ip_address}</Tile>}
            {log.entity_name && <Tile label="Tên đối tượng" wide>{log.entity_name}</Tile>}
            {device && <Tile label="Thiết bị" wide>{device}</Tile>}
          </div>

          {(log.old_value || log.new_value) && (
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Thay đổi</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-500">Trước</p>
                  <p className="whitespace-pre-line break-words text-sm text-gray-700">{log.old_value || '—'}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <p className="mb-1 text-xs font-semibold text-emerald-700">Sau</p>
                  <p className="whitespace-pre-line break-words text-sm text-gray-800">{log.new_value || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {extras.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Thông tin kèm theo</h3>
              <dl className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
                {extras.map((e) => (
                  <div key={e.key} className="flex gap-3 px-3 py-2 text-sm">
                    <dt className="w-36 flex-shrink-0 text-gray-500">{e.label}</dt>
                    <dd className="min-w-0 flex-1 break-all font-medium text-gray-800">{e.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="min-w-0 truncate text-xs text-gray-400" title={log.id}>Mã bản ghi: {log.id}</p>
            <button type="button" onClick={() => onCopy(log.id)} className="btn-secondary flex-shrink-0 !px-3 !py-1.5 text-xs">
              <Icon name="copy" className="h-3.5 w-3.5" />Sao chép
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FILTERS = { keyword: '', action: '', entity_type: '', user_id: '', from_date: '', to_date: '' };
const GRID = 'md:grid-cols-[8.5rem_minmax(0,14rem)_11rem_minmax(0,1fr)_1rem]';

export default function SystemLogsPage() {
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null); // dòng đang mở chi tiết (mỗi lúc chỉ mở một dòng)
  const limit = 50;

  const { data: usersData } = useQuery({ queryKey: ['admin-users-list'], queryFn: () => adminApi.getUsers() });
  const users = usersData?.data?.data || [];

  const setFilter = (patch) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); setOpenId(null); };
  const hasFilter = Object.values(filters).some(Boolean);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await logApi.getSystemLogs({ ...filters, page, limit });
        if (!alive) return;
        setLogs(res.data?.data || []);
        setMeta(res.data?.meta || null);
      } catch (err) {
        if (alive) toast.error(err?.response?.data?.message || 'Không tải được nhật ký');
      } finally {
        if (alive) setLoading(false);
      }
    }, 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [filters, page]);

  const changePage = (p) => { setPage(p); setOpenId(null); };

  const exportCSV = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Đối tượng', 'Mô tả chi tiết', 'IP'];
    const lines = logs.map((l) => [
      fullTime(l), l.user_name || 'Hệ thống', ROLE_LABELS[l.user_role] || l.user_role || '-', actionMeta(l.action).text,
      l.entity_name || '-', stripEmoji(l.description || ''), l.ip_address || '-',
    ].map(q).join(','));
    const csv = [headers.map(q).join(','), ...lines].join('\r\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nhat-ky-he-thong-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyId = (id) => navigator.clipboard?.writeText(id).then(() => toast.success('Đã sao chép mã bản ghi'), () => toast.error('Không sao chép được'));

  return (
    <div className="space-y-5">
      <PageBanner compact icon="history" title="Nhật ký hệ thống" subtitle="Lịch sử thao tác của người dùng trên toàn hệ thống. Bấm vào một dòng để xem chi tiết ngay bên dưới." />

      <div className="card !p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input className="input-field !py-2 !pl-9 text-sm" placeholder="Tìm theo mô tả, người thực hiện, đối tượng..." aria-label="Tìm trong nhật ký"
              value={filters.keyword} onChange={(e) => setFilter({ keyword: e.target.value })} />
          </div>
          <button type="button" onClick={exportCSV} disabled={logs.length === 0} className="btn-secondary whitespace-nowrap text-sm disabled:opacity-50">
            <Icon name="download" className="h-4 w-4" />Xuất CSV (trang này)
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <UserSearchSelect users={users} value={filters.user_id} onChange={(v) => setFilter({ user_id: v })} />
          <select className="input-field !py-2 text-sm" value={filters.entity_type} onChange={(e) => setFilter({ entity_type: e.target.value })} aria-label="Lọc theo đối tượng">
            <option value="">Đối tượng (Tất cả)</option>
            {Object.entries(ENTITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input-field !py-2 text-sm" value={filters.action} onChange={(e) => setFilter({ action: e.target.value })} aria-label="Lọc theo hành động">
            <option value="">Hành động (Tất cả)</option>
            {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v.text}</option>)}
          </select>
          <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
            <input type="date" className="input-field !py-2 text-sm" value={filters.from_date} max={filters.to_date || undefined} onChange={(e) => setFilter({ from_date: e.target.value })} aria-label="Từ ngày" />
            <span className="text-gray-400">–</span>
            <input type="date" className="input-field !py-2 text-sm" value={filters.to_date} min={filters.from_date || undefined} onChange={(e) => setFilter({ to_date: e.target.value })} aria-label="Đến ngày" />
          </div>
        </div>
        {hasFilter && (
          <button type="button" onClick={() => { setFilters({ ...EMPTY_FILTERS }); setPage(1); setOpenId(null); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800">
            <Icon name="x" className="h-4 w-4" />Xóa bộ lọc
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : logs.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <IconBadge name="history" tone="slate" size="lg" className="mx-auto" />
            <p className="mt-3 font-semibold text-gray-800">Không tìm thấy hoạt động nào</p>
            <p className="mt-1 text-sm text-gray-500">{hasFilter ? 'Thử bỏ bớt bộ lọc.' : 'Khi người dùng thao tác trên hệ thống, lịch sử sẽ hiện ở đây.'}</p>
          </div>
        ) : (
          <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`}>
            <div className={`hidden gap-x-4 border-b border-gray-100 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid ${GRID}`} aria-hidden="true">
              <span>Thời gian</span><span>Người thực hiện</span><span>Hành động</span><span>Nội dung</span><span />
            </div>
            <ul className="divide-y divide-gray-100">
              {logs.map((log) => {
                const t = logTime(log);
                const open = openId === log.id;
                return (
                  <li key={log.id} className={open ? 'bg-primary-50/30' : ''}>
                    <button type="button" onClick={() => setOpenId(open ? null : log.id)} aria-expanded={open} aria-controls={`log-detail-${log.id}`}
                      className={`group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 text-left transition-colors hover:bg-primary-50/50 focus-visible:bg-primary-50/50 focus-visible:outline-none sm:px-5 ${GRID}`}>
                      <span className="order-2 flex items-center justify-end gap-2 whitespace-nowrap text-right text-xs text-gray-500 md:order-none md:justify-start md:text-left">
                        <span>
                          <span className="block font-medium text-gray-700">{t.toLocaleDateString('vi-VN')}</span>
                          <span className="block text-gray-400">{t.toLocaleTimeString('vi-VN')}</span>
                        </span>
                        <Icon name="chevronDown" className={`h-4 w-4 flex-shrink-0 transition-transform md:hidden ${open ? 'rotate-180 text-primary-600' : 'text-gray-300'}`} />
                      </span>
                      <span className="order-3 col-span-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 md:order-none md:col-span-1">
                        <span className="truncate text-sm font-semibold text-gray-900">{log.user_name || 'Hệ thống'}</span>
                        <RoleChip role={log.user_role} />
                      </span>
                      <span className="order-1 md:order-none"><ActionChip action={log.action} /></span>
                      <span className={`order-4 col-span-2 text-sm text-gray-600 md:order-none md:col-span-1 ${open ? '' : 'line-clamp-2 md:line-clamp-1'}`}>
                        {stripEmoji(log.description) || log.entity_name || '—'}
                      </span>
                      <Icon name="chevronDown" className={`order-5 hidden h-4 w-4 transition-transform md:block ${open ? 'rotate-180 text-primary-600' : 'text-gray-300 group-hover:text-primary-500'}`} />
                    </button>
                    {open && <LogDetail log={log} onCopy={copyId} />}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-2 border-t border-gray-100 bg-white px-5 py-3 sm:flex-row">
            <span className="text-sm text-gray-500">
              Hiển thị {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} / {meta.total} kết quả
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={meta.page === 1} onClick={() => changePage(page - 1)} className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-50">
                <Icon name="chevronLeft" className="h-4 w-4" />Trước
              </button>
              <span className="px-2 text-sm font-semibold text-gray-700">Trang {meta.page} / {meta.totalPages}</span>
              <button type="button" disabled={meta.page === meta.totalPages} onClick={() => changePage(page + 1)} className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-50">
                Sau<Icon name="chevronRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
