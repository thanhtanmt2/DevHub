import React, { useState, useEffect } from 'react';
import { logApi } from '../../../api/logApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const ACTION_LABELS = {
  TASK_CREATED: { text: 'Tạo Task', color: 'bg-indigo-100 text-indigo-700' },
  TASK_UPDATED: { text: 'Cập nhật Task', color: 'bg-indigo-50 text-indigo-600' },
  TASK_STATUS_CHANGED: { text: 'Đổi TT Task', color: 'bg-purple-100 text-purple-700' },
  TASK_DELETED: { text: 'Xóa Task', color: 'bg-red-100 text-red-700' },
  TASK_APPROVED: { text: 'Duyệt Task', color: 'bg-emerald-100 text-emerald-700' },
  TASK_REVISION_REQUESTED: { text: 'Yêu cầu sửa', color: 'bg-orange-100 text-orange-700' },
  TASK_COMMENTED: { text: 'Bình luận', color: 'bg-blue-50 text-blue-600' },
  WORKSPACE_MEMBER_ADDED: { text: 'Thêm Member', color: 'bg-emerald-50 text-emerald-600' },
  WORKSPACE_MEMBER_REMOVED: { text: 'Xóa Member', color: 'bg-red-50 text-red-600' },
  WORKSPACE_MEMBER_ROLE_CHANGED: { text: 'Đổi Vai trò', color: 'bg-amber-100 text-amber-700' },
  PROJECT_UPDATED: { text: 'Cập nhật Dự án', color: 'bg-blue-50 text-blue-600' },
};

export default function WorkspaceLogs({ workspaceId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [page, workspaceId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await logApi.getWorkspaceLogs(workspaceId, { page, limit: 30 });
      setLogs(res.data?.data || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-700">Nhật ký hoạt động Workspace</h2>
          <button onClick={() => { setPage(1); fetchLogs(); }} className="text-xs text-blue-600 hover:underline">
            Làm mới
          </button>
        </div>

        {loading && logs.length === 0 ? (
          <div className="p-10 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map(log => {
              const meta = ACTION_LABELS[log.action] || { text: log.action, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                  <div className="w-32 flex-shrink-0 text-xs text-gray-400 font-medium">
                    {new Date(log.createdAt || log.created_at).toLocaleString('vi-VN', { 
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{log.user_name || 'Hệ thống'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                        {meta.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.description}</p>
                  </div>
                </div>
              );
            })}
            
            {logs.length === 0 && (
              <div className="p-10 text-center text-gray-400 text-sm">
                Không có hoạt động nào được ghi nhận.
              </div>
            )}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Trang {meta.page} / {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 bg-white border rounded text-xs disabled:opacity-50">Trước</button>
              <button disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 bg-white border rounded text-xs disabled:opacity-50">Sau</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
