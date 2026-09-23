import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logApi } from '../../api/logApi';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ACTION_LABELS = {
  // Auth
  USER_REGISTER: { text: 'Đăng ký mới', color: 'bg-green-100 text-green-700' },
  USER_LOGIN: { text: 'Đăng nhập', color: 'bg-blue-100 text-blue-700' },
  USER_LOGOUT: { text: 'Đăng xuất', color: 'bg-gray-100 text-gray-700' },
  
  // Task
  TASK_CREATED: { text: 'Tạo Task', color: 'bg-indigo-100 text-indigo-700' },
  TASK_UPDATED: { text: 'Cập nhật Task', color: 'bg-indigo-50 text-indigo-600' },
  TASK_STATUS_CHANGED: { text: 'Đổi TT Task', color: 'bg-purple-100 text-purple-700' },
  TASK_DELETED: { text: 'Xóa Task', color: 'bg-red-100 text-red-700' },
  TASK_APPROVED: { text: 'Duyệt Task', color: 'bg-emerald-100 text-emerald-700' },
  TASK_REVISION_REQUESTED: { text: 'Yêu cầu sửa', color: 'bg-orange-100 text-orange-700' },
  TASK_COMMENTED: { text: 'Bình luận', color: 'bg-blue-50 text-blue-600' },
  
  // Workspace
  WORKSPACE_MEMBER_ADDED: { text: 'Thêm Member', color: 'bg-emerald-50 text-emerald-600' },
  WORKSPACE_MEMBER_REMOVED: { text: 'Xóa Member', color: 'bg-red-50 text-red-600' },
  WORKSPACE_MEMBER_ROLE_CHANGED: { text: 'Đổi Vai trò', color: 'bg-amber-100 text-amber-700' },
  
  // Project
  PROJECT_CREATED: { text: 'Tạo Dự án', color: 'bg-blue-100 text-blue-700' },
  PROJECT_UPDATED: { text: 'Cập nhật Dự án', color: 'bg-blue-50 text-blue-600' },
  PROJECT_MANAGER_ASSIGNED: { text: 'Phân công PM', color: 'bg-fuchsia-100 text-fuchsia-700' },
  
  // Application
  APPLICATION_SUBMITTED: { text: 'Nộp đơn', color: 'bg-cyan-100 text-cyan-700' },
  APPLICATION_STATUS_CHANGED: { text: 'Cập nhật đơn', color: 'bg-cyan-50 text-cyan-600' },
  INTERVIEW_SCHEDULED: { text: 'Xếp lịch PV', color: 'bg-violet-100 text-violet-700' },
  
  // Payment
  PAYMENT_CREATED: { text: 'Tạo Payment', color: 'bg-teal-100 text-teal-700' },
  PAYMENT_PROCESSED: { text: 'Xử lý Payment', color: 'bg-teal-200 text-teal-800' },
  
  // Eval
  MEMBER_EVALUATED: { text: 'Đánh giá', color: 'bg-yellow-100 text-yellow-700' }
};

const ENTITY_TYPES = {
  'task': 'Công việc (Task)',
  'workspace_member': 'Thành viên Workspace',
  'project': 'Dự án',
  'project_application': 'Đơn ứng tuyển',
  'payment': 'Thanh toán',
  'evaluation': 'Đánh giá'
};

const UserSearchSelect = ({ users, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedUser = users.find(u => u.id === value);
  const displayValue = selectedUser ? selectedUser.full_name : "";

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-w-[220px]" ref={containerRef}>
      <div 
        className="input-field flex items-center justify-between cursor-pointer bg-white h-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-900 truncate" : "text-gray-500 truncate"}>
          {value ? displayValue : "Người thực hiện (Tất cả)"}
        </span>
        <span className="text-gray-400 text-xs ml-2">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b">
            <input 
              type="text" 
              className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:border-blue-500"
              placeholder="Tìm tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1">
            <div 
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${!value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              Tất cả người thực hiện
            </div>
            {filteredUsers.map(u => (
              <div 
                key={u.id}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${value === u.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                onClick={() => { onChange(u.id); setIsOpen(false); setSearch(""); }}
              >
                <div className="font-medium">{u.full_name}</div>
                <div className="text-xs opacity-70">{u.email}</div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500 text-center">Không tìm thấy</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    keyword: '',
    action: '',
    entity_type: '',
    user_id: '',
    from_date: '',
    to_date: '',
    page: 1,
    limit: 50
  });
  
  const [meta, setMeta] = useState(null);

  const { data: usersData } = useQuery({ queryKey: ['admin-users-list'], queryFn: () => adminApi.getUsers() });
  const users = usersData?.data?.data || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logApi.getSystemLogs(filters);
      setLogs(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Đối tượng', 'Mô tả chi tiết', 'IP'];
    const csvContent = [
      headers.join(','),
      ...logs.map(l => [
        `"${new Date(l.createdAt || l.created_at).toLocaleString('vi-VN')}"`,
        `"${l.user_name || 'Hệ thống'}"`,
        `"${l.user_role || '-'}"`,
        `"${ACTION_LABELS[l.action]?.text || l.action}"`,
        `"${l.entity_name || '-'}"`,
        `"${(l.description || '').replace(/"/g, '""')}"`,
        `"${l.ip_address || '-'}"`
      ].join(','))
    ].join('\\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system_logs_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="p-6">


      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3 bg-gray-50/50">
          <div className="flex gap-3 flex-wrap">
            <input 
              type="text" 
              placeholder="Tìm mô tả, đối tượng..."
              className="input-field flex-1 min-w-[200px]"
              value={filters.keyword}
              onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
            />
            
            <UserSearchSelect 
              users={users} 
              value={filters.user_id} 
              onChange={val => setFilters(prev => ({ ...prev, user_id: val, page: 1 }))} 
            />

            <select className="input-field max-w-[180px]" value={filters.entity_type} onChange={e => setFilters(prev => ({ ...prev, entity_type: e.target.value, page: 1 }))}>
              <option value="">Đối tượng (Tất cả)</option>
              {Object.entries(ENTITY_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>

            <select className="input-field max-w-[180px]" value={filters.action} onChange={e => setFilters(prev => ({ ...prev, action: e.target.value, page: 1 }))}>
              <option value="">Hành động (Tất cả)</option>
              {Object.entries(ACTION_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.text}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input type="date" className="input-field" value={filters.from_date} onChange={e => setFilters(prev => ({ ...prev, from_date: e.target.value, page: 1 }))} title="Từ ngày" />
              <span className="text-gray-400">-</span>
              <input type="date" className="input-field" value={filters.to_date} onChange={e => setFilters(prev => ({ ...prev, to_date: e.target.value, page: 1 }))} title="Đến ngày" />
            </div>

            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 px-6 whitespace-nowrap">
              <span>📥 Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading && logs.length === 0 ? (
            <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold sticky top-0 shadow-sm">
                <tr>
                  <th className="px-5 py-3 border-b">Thời gian</th>
                  <th className="px-5 py-3 border-b">Người thực hiện</th>
                  <th className="px-5 py-3 border-b">Hành động</th>
                  <th className="px-5 py-3 border-b">Đối tượng</th>
                  <th className="px-5 py-3 border-b">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => {
                  const meta = ACTION_LABELS[log.action] || { text: log.action, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt || log.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {log.user_name || 'Hệ thống'}
                        <div className="text-xs text-gray-400 font-normal">{log.user_role} • {log.ip_address}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${meta.color}`}>
                          {meta.text}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {log.entity_name || '-'}
                      </td>
                      <td className="px-5 py-3 text-gray-600 max-w-md truncate" title={log.description}>
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center text-gray-400">
                      Không tìm thấy lịch sử hoạt động nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
            <span className="text-sm text-gray-500">
              Trang {meta.page} / {meta.totalPages} ({meta.total} kết quả)
            </span>
            <div className="flex gap-2">
              <button 
                disabled={meta.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Trước
              </button>
              <button 
                disabled={meta.page === meta.totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
