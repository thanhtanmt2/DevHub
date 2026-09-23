import { useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import WorkspaceLogs from './components/WorkspaceLogs';
import { workspaceApi } from '@/api/workspaceApi';
import { taskApi } from '@/api/taskApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const STATUS_META = {
  TODO:        { label: 'Cần làm',      color: 'bg-gray-100',   dot: 'bg-gray-400',   text: 'text-gray-600' },
  IN_PROGRESS: { label: 'Đang làm',     color: 'bg-blue-50',    dot: 'bg-blue-500',   text: 'text-blue-700' },
  REVIEW:      { label: 'Chờ duyệt',    color: 'bg-amber-50',   dot: 'bg-amber-500',  text: 'text-amber-700' },
  DONE:        { label: 'Hoàn thành',   color: 'bg-green-50',   dot: 'bg-green-500',  text: 'text-green-700' },
};
const PRIORITY_META = {
  URGENT: { label: 'Khẩn cấp', color: 'text-red-600 bg-red-50',     icon: '🔴' },
  HIGH:   { label: 'Cao',      color: 'text-orange-600 bg-orange-50', icon: '🟠' },
  MEDIUM: { label: 'Bình thường', color: 'text-yellow-600 bg-yellow-50', icon: '🟡' },
  LOW:    { label: 'Thấp',     color: 'text-gray-500 bg-gray-100',   icon: '⚪' },
};
const LABEL_COLORS = {
  Frontend:  'bg-blue-100 text-blue-700',
  Backend:   'bg-purple-100 text-purple-700',
  Bug:       'bg-red-100 text-red-700',
  Feature:   'bg-green-100 text-green-700',
  Design:    'bg-pink-100 text-pink-700',
  Testing:   'bg-yellow-100 text-yellow-700',
  DevOps:    'bg-indigo-100 text-indigo-700',
  Research:  'bg-teal-100 text-teal-700',
};
const ALL_LABELS = Object.keys(LABEL_COLORS);
const MEMBER_ROLE_LABELS = { MANAGER: 'Quản lý', LEAD: 'Lead', MEMBER: 'Thành viên', VIEWER: 'Xem' };

// ─── Helper: Avatar initials ──────────────────────────────────────────────────
function Avatar({ name, size = 'sm', className = '' }) {
  const initials = name?.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase() || '?';
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const colors = ['bg-indigo-500','bg-purple-500','bg-pink-500','bg-blue-500','bg-teal-500','bg-green-500'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// ─── Task Card (Kanban) ───────────────────────────────────────────────────────
function TaskCard({ task, onClick, provided, snapshot, canManage }) {
  const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;
  const totalSubs = task.SubTasks?.length || 0;
  const doneSubs = task.SubTasks?.filter(s => s.is_done).length || 0;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 cursor-pointer
        hover:shadow-md hover:border-primary-200 transition-all select-none
        ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary-400 rotate-1' : ''}
        ${task.status === 'DONE' ? 'opacity-75' : ''}`}
    >
      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(l => (
            <span key={l} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${LABEL_COLORS[l] || 'bg-gray-100 text-gray-600'}`}>
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className={`text-sm font-semibold text-gray-900 leading-snug mb-2 ${task.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </p>

      {/* Priority + Deadline */}
      <div className="flex items-center gap-1.5 mb-2.5 text-xs">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${pm.color}`}>
          {pm.icon} {pm.label}
        </span>
        {task.deadline && (
          <span className={`ml-auto ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            {isOverdue ? '⚠️ ' : '📅 '}
            {new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>

      {/* Sub-task progress */}
      {totalSubs > 0 && (
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
            <span>Subtasks</span>
            <span>{doneSubs}/{totalSubs}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className="bg-primary-500 h-1 rounded-full transition-all"
              style={{ width: `${totalSubs ? (doneSubs / totalSubs) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Assignees + completion */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex -space-x-1.5">
          {task.Assignees?.slice(0, 3).map(a => (
            <Avatar
              key={a.id}
              name={a.CandidateProfile?.User?.full_name}
              size="sm"
              className="ring-2 ring-white"
            />
          ))}
          {(task.Assignees?.length || 0) > 3 && (
            <div className="w-7 h-7 bg-gray-200 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] text-gray-600 font-bold">
              +{task.Assignees.length - 3}
            </div>
          )}
          {(!task.Assignees?.length) && (
            <span className="text-[10px] text-gray-400">Chưa giao</span>
          )}
        </div>
        {task.completion_rate > 0 && task.status !== 'DONE' && (
          <span className="text-[10px] text-gray-400">{task.completion_rate}%</span>
        )}
        {task.status === 'DONE' && <span className="text-[10px] text-green-500 font-semibold">✅ Xong</span>}
      </div>
    </div>
  );
}

// ─── Task Detail Drawer ──────────────────────────────────────────────────────
function TaskDetailDrawer({ taskId, members, canManage, onClose, workspaceId }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [newSubTask, setNewSubTask] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'activity'
  const [reviewNote, setReviewNote] = useState('');
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getTaskById(taskId),
    enabled: !!taskId,
  });
  const task = data?.data?.data;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['task', taskId] });
    qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId], exact: false });
    qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
  };

  const updateMut = useMutation({
    mutationFn: (d) => taskApi.updateTask(taskId, d),
    onSuccess: () => { invalidate(); setEditMode(false); toast.success('Đã lưu'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Cập nhật thất bại')
  });
  const reviewMut = useMutation({
    mutationFn: (d) => taskApi.reviewTask(taskId, d),
    onSuccess: () => { invalidate(); setShowReviewPanel(false); toast.success('Đã duyệt task'); }
  });
  const addCommentMut = useMutation({
    mutationFn: (content) => taskApi.addComment(taskId, content),
    onSuccess: () => { invalidate(); setCommentText(''); }
  });
  const addSubTaskMut = useMutation({
    mutationFn: (title) => taskApi.addSubTask(taskId, title),
    onSuccess: () => { invalidate(); setNewSubTask(''); }
  });
  const updateSubTaskMut = useMutation({
    mutationFn: ({ subId, data }) => taskApi.updateSubTask(taskId, subId, data),
    onSuccess: invalidate,
  });
  const deleteTaskMut = useMutation({
    mutationFn: () => taskApi.deleteTask(taskId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId], exact: false }); onClose(); toast.success('Đã xóa task'); }
  });

  if (!taskId) return null;

  if (isLoading) return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-white shadow-2xl z-40 flex items-center justify-center border-l">
      <LoadingSpinner />
    </div>
  );

  if (!task) return null;

  const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;
  const totalSubs = task.SubTasks?.length || 0;
  const doneSubs = task.SubTasks?.filter(s => s.is_done).length || 0;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';
  const canReview = canManage && task.status === 'REVIEW';
  const myMemberId = members.find(m => m.CandidateProfile?.user_id === user?.id)?.id;
  const isAssignedToMe = task.Assignees?.some(a => a.id === myMemberId);

  const startEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.slice(0,10) : '',
      estimated_hours: task.estimated_hours || '',
      labels: task.labels || [],
      assignee_ids: task.Assignees?.map(a => a.id) || [],
    });
    setEditMode(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-white shadow-2xl z-40 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b bg-gray-50">
          <div className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_META[task.status]?.text} ${STATUS_META[task.status]?.color}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_META[task.status]?.dot} mr-1`}></span>
            {STATUS_META[task.status]?.label}
          </div>
          <div className="flex-1" />
          {canManage && (
            <button onClick={startEdit} className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200">
              ✏️ Sửa
            </button>
          )}
          {canManage && (
            <button onClick={() => { if(confirm('Xóa task này?')) deleteTaskMut.mutate(); }}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50">
              🗑 Xóa
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold ml-1">✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Edit mode */}
          {editMode && editData ? (
            <div className="p-5 space-y-4">
              <h2 className="font-bold text-gray-700 mb-2">Chỉnh sửa Task</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Tiêu đề</label>
                <input className="input-field" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Mô tả</label>
                <textarea className="input-field resize-none" rows={4} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Độ ưu tiên</label>
                  <select className="input-field text-sm" value={editData.priority} onChange={e => setEditData({...editData, priority: e.target.value})}>
                    {Object.entries(PRIORITY_META).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Deadline</label>
                  <input type="date" className="input-field text-sm" value={editData.deadline} onChange={e => setEditData({...editData, deadline: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Ước tính (giờ)</label>
                <input type="number" className="input-field text-sm" step="0.5" value={editData.estimated_hours} onChange={e => setEditData({...editData, estimated_hours: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LABELS.map(l => (
                    <button key={l} type="button"
                      onClick={() => setEditData(d => ({ ...d, labels: d.labels.includes(l) ? d.labels.filter(x => x !== l) : [...d.labels, l] }))}
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${editData.labels.includes(l) ? LABEL_COLORS[l] + ' border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Người thực hiện</label>
                <div className="space-y-1.5">
                  {members.map(m => {
                    const name = m.CandidateProfile?.User?.full_name;
                    const checked = editData.assignee_ids.includes(m.id);
                    return (
                      <label key={m.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${checked ? 'bg-primary-50 border-primary-200' : 'border-transparent hover:bg-gray-50'}`}>
                        <input type="checkbox" className="rounded" checked={checked}
                          onChange={() => setEditData(d => ({...d, assignee_ids: checked ? d.assignee_ids.filter(id => id !== m.id) : [...d.assignee_ids, m.id]}))} />
                        <Avatar name={name} size="sm" />
                        <span className="text-sm text-gray-800">{name}</span>
                        <span className="ml-auto text-[10px] text-gray-400">{MEMBER_ROLE_LABELS[m.role]}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button onClick={() => updateMut.mutate(editData)} disabled={updateMut.isPending || !editData.title}
                  className="btn-primary flex-1 py-2">
                  {updateMut.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button onClick={() => setEditMode(false)} className="btn-secondary px-4 py-2">Hủy</button>
              </div>
            </div>
          ) : (
            <div>
              {/* Task title + info */}
              <div className="px-5 pt-5 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-3">{task.title}</h2>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-400 text-xs font-semibold uppercase">Ưu tiên</div>
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${pm.color}`}>
                    {pm.icon} {pm.label}
                  </div>
                  
                  <div className="text-gray-400 text-xs font-semibold uppercase">Deadline</div>
                  <div className={`text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-gray-700'}`}>
                    {task.deadline ? `${isOverdue ? '⚠️ ' : ''}${new Date(task.deadline).toLocaleDateString('vi-VN', { day:'numeric', month:'long', year:'numeric' })}` : '—'}
                  </div>
                  
                  {task.estimated_hours && (<>
                    <div className="text-gray-400 text-xs font-semibold uppercase">Ước tính</div>
                    <div className="text-sm text-gray-700">{task.estimated_hours} giờ</div>
                  </>)}

                  {task.labels?.length > 0 && (<>
                    <div className="text-gray-400 text-xs font-semibold uppercase">Labels</div>
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map(l => (
                        <span key={l} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${LABEL_COLORS[l] || 'bg-gray-100 text-gray-600'}`}>{l}</span>
                      ))}
                    </div>
                  </>)}
                </div>
              </div>

              {/* Assignees */}
              <div className="px-5 py-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Người thực hiện</p>
                  {canManage && !isAssigning && (
                    <button onClick={() => setIsAssigning(true)} className="text-[10px] text-primary-600 font-medium hover:underline">+ Giao việc</button>
                  )}
                  {canManage && isAssigning && (
                    <button onClick={() => setIsAssigning(false)} className="text-[10px] text-gray-500 font-medium hover:underline">Đóng</button>
                  )}
                </div>
                
                {isAssigning && canManage && (
                  <div className="mb-3 space-y-1.5 p-2 bg-gray-50 rounded-lg border">
                    {members.map(m => {
                      const name = m.CandidateProfile?.User?.full_name;
                      const isAssigned = task.Assignees?.some(a => a.id === m.id);
                      return (
                        <label key={m.id} className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${isAssigned ? 'bg-primary-50' : 'hover:bg-white'}`}>
                          <input type="checkbox" className="rounded accent-primary-600" checked={isAssigned}
                            onChange={() => {
                              const newIds = isAssigned 
                                ? task.Assignees.filter(a => a.id !== m.id).map(a => a.id)
                                : [...(task.Assignees?.map(a => a.id) || []), m.id];
                              updateMut.mutate({ assignee_ids: newIds });
                            }} 
                          />
                          <Avatar name={name} size="sm" />
                          <span className="text-sm text-gray-800 flex-1">{name}</span>
                          <span className="text-[10px] text-gray-400">{MEMBER_ROLE_LABELS[m.role]}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {task.Assignees?.length > 0 ? (
                  <div className="space-y-2">
                    {task.Assignees.map(a => (
                      <div key={a.id} className="flex items-center gap-2">
                        <Avatar name={a.CandidateProfile?.User?.full_name} size="sm" />
                        <span className="text-sm text-gray-800">{a.CandidateProfile?.User?.full_name}</span>
                        <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{MEMBER_ROLE_LABELS[a.role]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5 border border-dashed border-gray-300">
                    <span className="text-sm text-gray-500">Chưa có người thực hiện</span>
                    {myMemberId && (
                      <button onClick={() => updateMut.mutate({ assignee_ids: [myMemberId] })} disabled={updateMut.isPending} className="text-xs bg-white border shadow-sm px-2.5 py-1 rounded hover:bg-gray-50 font-medium text-gray-700">
                        {updateMut.isPending ? '...' : '✋ Nhận việc này'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {task.description && (
                <div className="px-5 py-4 border-b">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Mô tả</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Progress & Workflow */}
              <div className="px-5 py-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Tiến độ</p>
                  <span className="text-sm font-bold text-primary-700">{task.completion_rate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${task.completion_rate}%` }} />
                </div>
                
                {/* Workflow Actions */}
                {(isAssignedToMe || canManage) && task.status !== 'DONE' && (
                  <div className="flex gap-2 flex-wrap">
                    {task.status === 'TODO' && (
                      <button onClick={() => updateMut.mutate({ status: 'IN_PROGRESS' })} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors">
                        🚀 Bắt đầu làm (In Progress)
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button onClick={() => updateMut.mutate({ status: 'REVIEW' })} className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 shadow-sm transition-colors">
                        ✅ Hoàn thành & Gửi duyệt
                      </button>
                    )}
                    {task.status === 'REVIEW' && !canManage && (
                      <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                        ⏳ Đang chờ Quản lý duyệt...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sub-tasks */}
              <div className="px-5 py-4 border-b">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Subtasks {totalSubs > 0 && <span className="ml-1 text-gray-600">({doneSubs}/{totalSubs})</span>}
                  </p>
                </div>
                <div className="space-y-2 mb-3">
                  {task.SubTasks?.map(sub => (
                    <label key={sub.id} className="flex items-center gap-2.5 group cursor-pointer">
                      <input type="checkbox" className="rounded accent-primary-600 w-4 h-4 flex-shrink-0"
                        checked={sub.is_done}
                        onChange={() => updateSubTaskMut.mutate({ subId: sub.id, data: { is_done: !sub.is_done } })}
                      />
                      <span className={`text-sm flex-1 ${sub.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {sub.title}
                      </span>
                    </label>
                  ))}
                </div>
                {(canManage || isAssignedToMe) && (
                  <div className="flex gap-2">
                    <input className="input-field py-1.5 text-sm flex-1" placeholder="Thêm subtask..."
                      value={newSubTask} onChange={e => setNewSubTask(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newSubTask.trim()) { addSubTaskMut.mutate(newSubTask); } }}
                    />
                    <button onClick={() => newSubTask.trim() && addSubTaskMut.mutate(newSubTask)}
                      className="btn-secondary px-3 py-1.5 text-sm">
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Manager review panel */}
              {canReview && (
                <div className="px-5 py-4 border-b bg-amber-50">
                  <p className="text-sm font-semibold text-amber-700 mb-2">⏳ Task đang chờ duyệt</p>
                  {!showReviewPanel ? (
                    <button onClick={() => setShowReviewPanel(true)} className="btn-primary text-sm py-1.5 px-3">
                      Duyệt task này
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <textarea className="input-field resize-none text-sm" rows={2} placeholder="Nhận xét (tùy chọn)..."
                        value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => reviewMut.mutate({ action: 'APPROVE', review_note: reviewNote })}
                          disabled={reviewMut.isPending}
                          className="btn-primary bg-green-600 hover:bg-green-700 flex-1 py-1.5 text-sm">
                          ✅ Duyệt (Approve)
                        </button>
                        <button onClick={() => reviewMut.mutate({ action: 'REVISION', review_note: reviewNote })}
                          disabled={reviewMut.isPending || !reviewNote}
                          className="btn-secondary text-amber-600 border-amber-300 flex-1 py-1.5 text-sm">
                          ↩️ Yêu cầu sửa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review note (if rejected) */}
              {task.review_status === 'REVISION_REQUIRED' && task.review_note && (
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
                  <p className="text-xs font-semibold text-orange-600 mb-1">📝 Yêu cầu chỉnh sửa từ Manager:</p>
                  <p className="text-sm text-orange-700 italic">"{task.review_note}"</p>
                </div>
              )}

              {/* Tab bar */}
              <div className="flex border-b px-5 gap-4 mt-2">
                <button onClick={() => setActiveTab('details')}
                  className={`text-sm py-2.5 font-medium border-b-2 -mb-px transition-colors ${activeTab === 'details' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  💬 Bình luận ({task.Comments?.length || 0})
                </button>
                <button onClick={() => setActiveTab('activity')}
                  className={`text-sm py-2.5 font-medium border-b-2 -mb-px transition-colors ${activeTab === 'activity' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  📋 Lịch sử
                </button>
              </div>

              {/* Comments */}
              {activeTab === 'details' && (
                <div className="px-5 py-4">
                  <div className="space-y-3 mb-4">
                    {task.Comments?.map(c => (
                      <div key={c.id} className="flex gap-2.5">
                        <Avatar name={c.Author?.CandidateProfile?.User?.full_name} size="sm" className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-xs font-semibold text-gray-700 mb-0.5">
                            {c.Author?.CandidateProfile?.User?.full_name}
                            <span className="text-gray-400 font-normal ml-2">
                              {new Date(c.created_at).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                            </span>
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    {!task.Comments?.length && (
                      <p className="text-center text-sm text-gray-400 py-4">Chưa có bình luận nào</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <textarea className="input-field resize-none text-sm flex-1" rows={2}
                      placeholder="Viết bình luận..."
                      value={commentText} onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && commentText.trim()) { e.preventDefault(); addCommentMut.mutate(commentText); } }}
                    />
                    <button onClick={() => commentText.trim() && addCommentMut.mutate(commentText)}
                      disabled={addCommentMut.isPending}
                      className="btn-primary self-end px-3 py-2 text-sm">
                      Gửi
                    </button>
                  </div>
                </div>
              )}

              {/* Activity log */}
              {activeTab === 'activity' && (
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {task.Activities?.map(a => (
                      <div key={a.id} className="flex gap-2.5">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                          {a.action === 'STATUS_CHANGED' ? '🔄' :
                           a.action === 'TASK_CREATED' ? '✨' :
                           a.action === 'TASK_APPROVED' ? '✅' :
                           a.action === 'TASK_REVISION' ? '↩️' :
                           a.action === 'COMMENT_ADDED' ? '💬' :
                           a.action === 'ASSIGNED' ? '👤' : '📝'}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm text-gray-700">{a.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {a.Actor?.CandidateProfile?.User?.full_name || 'Hệ thống'} · {new Date(a.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {!task.Activities?.length && (
                      <p className="text-center text-sm text-gray-400 py-4">Chưa có hoạt động nào</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────
function CreateTaskModal({ workspaceId, members, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', deadline: '',
    estimated_hours: '', labels: [], assignee_ids: [], sub_tasks: []
  });
  const [subInput, setSubInput] = useState('');
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const createMut = useMutation({
    mutationFn: (data) => taskApi.createTask(workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries(['workspace-tasks', workspaceId]);
      toast.success('✅ Đã tạo task!');
      onCreated?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Lỗi tạo task'),
  });

  const addSub = () => {
    if (subInput.trim()) {
      setForm(f => ({ ...f, sub_tasks: [...f.sub_tasks, subInput.trim()] }));
      setSubInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">✨ Tạo Task Mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tiêu đề *</label>
            <input className="input-field" placeholder="VD: Thiết kế màn hình Login"
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mô tả</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Mô tả chi tiết công việc..."
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Độ ưu tiên</label>
              <select className="input-field text-sm" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deadline</label>
              <input type="date" className="input-field text-sm" value={form.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ước tính (giờ)</label>
            <input type="number" className="input-field text-sm" step="0.5" min="0"
              placeholder="8" value={form.estimated_hours}
              onChange={e => setForm({...form, estimated_hours: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LABELS.map(l => (
                <button key={l} type="button"
                  onClick={() => setForm(f => ({ ...f, labels: f.labels.includes(l) ? f.labels.filter(x => x !== l) : [...f.labels, l] }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.labels.includes(l) ? LABEL_COLORS[l] + ' border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Giao cho</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {members.map(m => {
                const name = m.CandidateProfile?.User?.full_name;
                const checked = form.assignee_ids.includes(m.id);
                return (
                  <label key={m.id} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-all ${checked ? 'bg-primary-50 border-primary-200' : 'border-transparent hover:bg-gray-50'}`}>
                    <input type="checkbox" className="rounded accent-primary-600" checked={checked}
                      onChange={() => setForm(f => ({ ...f, assignee_ids: checked ? f.assignee_ids.filter(id => id !== m.id) : [...f.assignee_ids, m.id] }))} />
                    <Avatar name={name} size="sm" />
                    <span className="text-sm text-gray-800 flex-1">{name}</span>
                    <span className="text-[10px] text-gray-400">{MEMBER_ROLE_LABELS[m.role]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtasks</label>
            <div className="space-y-1.5 mb-2">
              {form.sub_tasks.map((st, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <span className="text-gray-400 text-xs">☐</span>
                  <span className="text-sm text-gray-700 flex-1">{st}</span>
                  <button onClick={() => setForm(f => ({ ...f, sub_tasks: f.sub_tasks.filter((_, j) => j !== i) }))}
                    className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field py-1.5 text-sm flex-1" placeholder="Thêm subtask..."
                value={subInput} onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSub()} />
              <button onClick={addSub} className="btn-secondary px-3 text-sm">+</button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-2">
          <button onClick={() => createMut.mutate(form)} disabled={!form.title || createMut.isPending}
            className="btn-primary flex-1 py-2.5">
            {createMut.isPending ? 'Đang tạo...' : '✨ Tạo Task'}
          </button>
          <button onClick={onClose} className="btn-secondary px-5 py-2.5">Hủy</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main WorkspacePage ───────────────────────────────────────────────────────
export default function WorkspacePage() {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [activeSection, setActiveSection] = useState('board'); // 'board' | 'stats' | 'members'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filters, setFilters] = useState({ priority: '', assignee_id: '', label: '' });
  const [optimisticTasks, setOptimisticTasks] = useState(null);
  const [kanbanZoom, setKanbanZoom] = useState(0.85); // Default hơi nhỏ lại một chút cho dễ nhìn

  const { data: wsData, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceApi.getWorkspaceDetail(id),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['workspace-tasks', id, filters],
    queryFn: () => taskApi.getWorkspaceTasks(id, { 
      priority: filters.priority || undefined,
      label: filters.label || undefined,
    }),
  });

  const workspace = wsData?.data?.data;
  const members = workspace?.WorkspaceMembers?.filter(m => m.status === 'ACTIVE') || [];
  const allTasks = optimisticTasks || tasksData?.data?.data || [];
  const canManage = isAdmin() || workspace?.isManager || 
    ['MANAGER', 'LEAD'].includes(members.find(m => m.CandidateProfile?.user_id === user?.id)?.role);

  const { data: statsData } = useQuery({
    queryKey: ['workspace-stats', id],
    queryFn: () => workspaceApi.getWorkspaceStats(id),
    enabled: activeSection === 'stats',
  });
  const wsStats = statsData?.data?.data;

  const updateRoleMut = useMutation({
    mutationFn: ({ memberId, role }) => workspaceApi.updateMemberRole(id, memberId, role),
    onSuccess: () => { qc.invalidateQueries(['workspace', id]); toast.success('Đã cập nhật vai trò'); }
  });
  const removeMemberMut = useMutation({
    mutationFn: (memberId) => workspaceApi.removeMember(id, memberId),
    onSuccess: () => { qc.invalidateQueries(['workspace', id]); toast.success('Đã xóa thành viên'); }
  });

  // Filter tasks
  const filteredTasks = allTasks.filter(t => {
    if (filters.assignee_id && !t.Assignees?.some(a => a.id === filters.assignee_id)) return false;
    return true;
  });

  // Stats
  const stats = {
    total: allTasks.length,
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: allTasks.filter(t => t.status === 'DONE').length,
    overdue: allTasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'DONE').length,
  };
  const completionRate = stats.total > 0 
    ? Math.round(allTasks.reduce((acc, t) => acc + (t.completion_rate || 0), 0) / stats.total) 
    : 0;

  // Group by status for kanban
  const columns = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(t => t.status === status);
    return acc;
  }, {});

  // Drag & drop
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    let newStatus = destination.droppableId;
    const task = allTasks.find(t => t.id === draggableId);
    if (!task) return;

    if (newStatus === 'DONE' && !canManage) {
      newStatus = 'REVIEW';
      toast('Tự động chuyển sang Chờ duyệt để Quản lý xác nhận', { icon: '⏳' });
    }

    // Optimistic update
    setOptimisticTasks(prev => {
      const tasks = prev || allTasks;
      return tasks.map(t => t.id === draggableId ? { ...t, status: newStatus } : t);
    });

    taskApi.updateTask(draggableId, { status: newStatus })
      .then(() => {
        qc.invalidateQueries(['workspace-tasks', id]);
        setOptimisticTasks(null);
      })
      .catch((e) => {
        setOptimisticTasks(null);
        toast.error(e.response?.data?.message || 'Cập nhật thất bại');
      });
  }, [allTasks, id, qc, canManage]);

  if (wsLoading) return <LoadingSpinner />;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-50/50 border border-gray-200 rounded-xl overflow-hidden min-w-0 w-full relative">
      {/* Header */}
      <div className="bg-white border-b px-5 py-3 flex items-center gap-3 flex-wrap">
        <div className="mr-2">
          <h1 className="text-lg font-bold text-gray-900 leading-tight">{workspace?.name}</h1>
          <p className="text-xs text-gray-500">{workspace?.Project?.name}</p>
        </div>

        {/* Stats chips */}
        <div className="flex gap-2 flex-wrap">
          <div className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">
            📋 {stats.total} tasks
          </div>
          <div className="text-xs bg-blue-50 px-2.5 py-1 rounded-full text-blue-700">
            ⚡ {stats.inProgress} đang làm
          </div>
          <div className="text-xs bg-green-50 px-2.5 py-1 rounded-full text-green-700">
            ✅ {stats.done} hoàn thành
          </div>
          {stats.overdue > 0 && (
            <div className="text-xs bg-red-50 px-2.5 py-1 rounded-full text-red-600 font-semibold">
              ⚠️ {stats.overdue} quá hạn
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 ml-2">
          <div className="w-24 bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
          </div>
          <span className="text-xs text-gray-500">{completionRate}%</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Section tabs */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setActiveSection('board')}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'board' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
              📋 Board
            </button>
            <button onClick={() => setActiveSection('stats')}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'stats' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
              📊 Thống kê
            </button>
            {canManage && (
              <>
                <button onClick={() => setActiveSection('members')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'members' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                  👥 Thành viên
                </button>
                <button onClick={() => setActiveSection('logs')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'logs' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                  📜 Nhật ký
                </button>
              </>
            )}
          </div>

          {/* View toggle (only in board mode) */}
          {activeSection === 'board' && (
            <>
              {viewMode === 'kanban' && (
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 hidden sm:flex border border-gray-200 mr-2">
                  <span className="text-xs text-gray-500 mr-2">🔍</span>
                  <input 
                    type="range" min="0.5" max="1.5" step="0.05" 
                    value={kanbanZoom} onChange={(e) => setKanbanZoom(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    title="Thu phóng Kanban"
                  />
                  <span className="text-[10px] text-gray-500 w-8 text-right font-medium">
                    {Math.round(kanbanZoom * 100)}%
                  </span>
                </div>
              )}
              <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                <button onClick={() => setViewMode('kanban')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'}`}>
                  ⊞ Kanban
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'}`}>
                  ≡ Danh sách
                </button>
              </div>
            </>
          )}

          {canManage && activeSection === 'board' && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-1.5 px-3">
              + Tạo Task
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b px-5 py-2 flex items-center gap-3 text-sm flex-wrap">
        <span className="text-xs text-gray-400 font-semibold uppercase">Bộ lọc:</span>
        
        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
          value={filters.priority} onChange={e => setFilters(f => ({...f, priority: e.target.value}))}>
          <option value="">Tất cả ưu tiên</option>
          {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>

        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
          value={filters.label} onChange={e => setFilters(f => ({...f, label: e.target.value}))}>
          <option value="">Tất cả label</option>
          {ALL_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
          value={filters.assignee_id} onChange={e => setFilters(f => ({...f, assignee_id: e.target.value}))}>
          <option value="">Tất cả thành viên</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.CandidateProfile?.User?.full_name}</option>)}
        </select>

        {/* Members avatars */}
        <div className="ml-auto flex -space-x-2">
          {members.slice(0, 5).map(m => (
            <div key={m.id} title={`${m.CandidateProfile?.User?.full_name} (${MEMBER_ROLE_LABELS[m.role]})`}>
              <Avatar name={m.CandidateProfile?.User?.full_name} size="sm" className="ring-2 ring-white cursor-pointer"
                onClick={() => setFilters(f => ({ ...f, assignee_id: f.assignee_id === m.id ? '' : m.id }))} />
            </div>
          ))}
          {members.length > 5 && (
            <div className="w-7 h-7 bg-gray-200 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] text-gray-600">
              +{members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {/* ─── Stats Section ─── */}
      {activeSection === 'stats' && (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!wsStats ? (
            <div className="flex items-center justify-center h-32"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* Overview cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Tổng task', value: wsStats.total, color: 'bg-gray-50 text-gray-700', icon: '📋' },
                  { label: 'Cần làm', value: wsStats.by_status?.TODO, color: 'bg-gray-50 text-gray-600', icon: '○' },
                  { label: 'Đang làm', value: wsStats.by_status?.IN_PROGRESS, color: 'bg-blue-50 text-blue-700', icon: '⚡' },
                  { label: 'Hoàn thành', value: wsStats.by_status?.DONE, color: 'bg-green-50 text-green-700', icon: '✅' },
                  { label: 'Quá hạn', value: wsStats.overdue, color: 'bg-red-50 text-red-600', icon: '⚠️' },
                ].map((s, i) => (
                  <div key={i} className={`rounded-xl p-3 ${s.color} border border-white/50`}>
                    <p className="text-2xl font-black">{s.value ?? 0}</p>
                    <p className="text-xs font-medium mt-0.5 opacity-75">{s.icon} {s.label}</p>
                  </div>
                ))}
              </div>

              {/* Completion rate */}
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold text-gray-800">Tiến độ tổng thể</h3>
                  <span className="text-2xl font-black text-primary-600">{wsStats.completion_rate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary-500 to-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${wsStats.completion_rate}%` }} />
                </div>
                {wsStats.due_soon > 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">⏰ {wsStats.due_soon} task sắp đến hạn trong 3 ngày tới</p>
                )}
              </div>

              {/* Member performance */}
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">Hiệu suất thành viên</h3>
                <div className="space-y-3">
                  {wsStats.members?.map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800 truncate">{m.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {m.done}/{m.total_assigned} xong
                            {m.overdue > 0 && <span className="text-red-500 ml-1">· {m.overdue} quá hạn</span>}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${m.total_assigned ? Math.round((m.done / m.total_assigned) * 100) : 0}%` }} />
                        </div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0
                        ${m.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                          m.role === 'LEAD' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'}`}>
                        {MEMBER_ROLE_LABELS[m.role] || 'Thành viên'}
                      </span>
                    </div>
                  ))}
                  {!wsStats.members?.length && <p className="text-sm text-gray-400 text-center py-4">Không có dữ liệu</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Members Section ─── */}
      {activeSection === 'members' && (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-800">👥 Quản lý thành viên ({members.length})</h3>
              </div>
              <div className="divide-y">
                {members.map(m => {
                  const name = m.CandidateProfile?.User?.full_name;
                  const email = m.CandidateProfile?.User?.email;
                  const isMe = m.CandidateProfile?.user_id === user?.id;
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{name} {isMe && <span className="text-xs text-primary-600">(bạn)</span>}</p>
                        <p className="text-xs text-gray-400 truncate">{email}</p>
                      </div>
                      {/* Role selector */}
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        value={m.role || 'MEMBER'}
                        onChange={e => updateRoleMut.mutate({ memberId: m.id, role: e.target.value })}
                        disabled={!canManage || updateRoleMut.isPending}
                      >
                        {Object.entries(MEMBER_ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      {/* Remove button (admin only) */}
                      {(isAdmin() || workspace?.isManager) && !isMe && (
                        <button
                          onClick={() => { if (confirm(`Xóa ${name} khỏi workspace?`)) removeMemberMut.mutate(m.id); }}
                          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  );
                })}
                {!members.length && (
                  <div className="py-10 text-center text-gray-400">
                    <p className="text-3xl mb-2">👤</p>
                    <p className="text-sm">Chưa có thành viên nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Logs Section ─── */}
      {activeSection === 'logs' && canManage && (
        <WorkspaceLogs workspaceId={id} />
      )}

      {/* ─── Board Section ─── */}
      {activeSection === 'board' && tasksLoading ? (
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      ) : activeSection === 'board' && viewMode === 'kanban' ? (
        /* ─── Kanban View ─── */
        <div className="flex-1 overflow-x-auto overflow-y-auto px-5 py-4 min-h-0 min-w-0">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full min-w-max" style={{ zoom: kanbanZoom }}>
              {STATUS_COLUMNS.map(statusId => (
                <Droppable key={statusId} droppableId={statusId}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`flex flex-col rounded-2xl w-72 min-h-[200px] transition-colors
                        ${snapshot.isDraggingOver ? 'bg-primary-50 ring-2 ring-primary-300' : STATUS_META[statusId].color}`}>
                      
                      {/* Column header */}
                      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_META[statusId].dot}`}></span>
                        <h3 className={`text-sm font-bold flex-1 ${STATUS_META[statusId].text}`}>
                          {STATUS_META[statusId].label}
                        </h3>
                        <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                          {columns[statusId].length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                        {columns[statusId].map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}
                            isDragDisabled={!canManage && !task.Assignees?.some(a => a.CandidateProfile?.user_id === user?.id)}>
                            {(prov, snap) => (
                              <TaskCard task={task} provided={prov} snapshot={snap}
                                canManage={canManage}
                                onClick={() => setSelectedTaskId(task.id)} />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Add task shortcut */}
                        {canManage && (
                          <button onClick={() => setShowCreateModal(true)}
                            className="w-full text-left text-xs text-gray-400 hover:text-gray-600 px-2 py-2 rounded-lg hover:bg-white/60 transition-colors">
                            + Thêm task...
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      ) : activeSection === 'board' ? (
        /* ─── List View ─── */
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_120px_120px_150px_100px] gap-4 px-4 py-2.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
              <span>Task</span>
              <span>Ưu tiên</span>
              <span>Trạng thái</span>
              <span>Người thực hiện</span>
              <span>Deadline</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredTasks.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-medium">Không có task nào</p>
                  {canManage && <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-3 text-sm">Tạo task đầu tiên</button>}
                </div>
              ) : filteredTasks.map(task => {
                const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;
                const sm = STATUS_META[task.status] || STATUS_META.TODO;
                const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';
                return (
                  <div key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="grid grid-cols-[1fr_120px_120px_150px_100px] gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer items-center">
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                      </div>
                      {task.labels?.length > 0 && (
                        <div className="flex gap-1">
                          {task.labels.slice(0,3).map(l => (
                            <span key={l} className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${LABEL_COLORS[l] || 'bg-gray-100 text-gray-600'}`}>{l}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${pm.color}`}>
                      {pm.icon} {pm.label}
                    </span>

                    <div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sm.text} ${sm.color}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${sm.dot} mr-1`}></span>
                        {sm.label}
                      </span>
                    </div>

                    <div className="flex -space-x-1.5">
                      {task.Assignees?.slice(0, 3).map(a => (
                        <Avatar key={a.id} name={a.CandidateProfile?.User?.full_name} size="sm" className="ring-2 ring-white" />
                      ))}
                      {!task.Assignees?.length && <span className="text-xs text-gray-400">—</span>}
                    </div>

                    <span className={`text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }) : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Task Detail Drawer */}
      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          members={members}
          canManage={canManage}
          workspaceId={id}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          workspaceId={id}
          members={members}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
