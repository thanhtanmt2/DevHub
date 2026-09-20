import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { workspaceApi } from '@/api/workspaceApi';
import { taskApi } from '@/api/taskApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const COLUMN_LABELS = { TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', REVIEW: 'Chờ duyệt', DONE: 'Hoàn thành' };

export default function WorkspacePage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', workspace_member_id: '' });

  const { data: wsData, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceApi.getWorkspaceDetail(id),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['workspace-tasks', id],
    queryFn: () => taskApi.getWorkspaceTasks(id),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => taskApi.updateTask(taskId, data),
    onSuccess: () => qc.invalidateQueries(['workspace-tasks', id]),
    onError: () => { toast.error('Cập nhật trạng thái thất bại'); qc.invalidateQueries(['workspace-tasks', id]); }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskApi.createTask(id, data),
    onSuccess: () => { qc.invalidateQueries(['workspace-tasks', id]); setShowTaskModal(false); toast.success('Đã tạo task'); setNewTask({title:'', description:'', workspace_member_id:''}); }
  });

  if (wsLoading || tasksLoading) return <LoadingSpinner />;
  const workspace = wsData?.data?.data;
  const tasks = tasksData?.data?.data || [];
  const members = workspace?.WorkspaceMembers || [];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (source.droppableId === destination.droppableId) return;

    // Optimistic UI update could go here, but for simplicity we rely on React Query invalidation
    // Call API
    updateTaskMutation.mutate({ taskId: draggableId, data: { status: destination.droppableId } });
  };

  // Group tasks by status
  const columns = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace?.name}</h1>
          <p className="text-gray-500 text-sm">Dự án: {workspace?.InternalProject?.name}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin() && (
            <button onClick={() => setShowTaskModal(true)} className="btn-primary">
              + Thêm Task
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STATUS_COLUMNS.map(statusId => (
              <Droppable key={statusId} droppableId={statusId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-gray-100/50 rounded-xl p-3 w-80 flex flex-col ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}
                  >
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                      {COLUMN_LABELS[statusId]}
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{columns[statusId].length}</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {columns[statusId].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-3 rounded-lg shadow-sm border border-gray-100 ${snapshot.isDragging ? 'shadow-md ring-2 ring-primary-500' : ''}`}
                            >
                              <h4 className="font-medium text-gray-900 text-sm mb-1">{task.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                                  {task.WorkspaceMember?.CandidateProfile?.User?.full_name || 'Unassigned'}
                                </span>
                                <span className="text-xs text-gray-400">{task.completion_rate}%</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Thêm Task Mới</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giao cho</label>
                <select className="input-field" value={newTask.workspace_member_id} onChange={e => setNewTask({...newTask, workspace_member_id: e.target.value})}>
                  <option value="">-- Chọn thành viên --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.CandidateProfile?.User?.full_name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => createTaskMutation.mutate(newTask)} disabled={!newTask.title || createTaskMutation.isPending} className="btn-primary">
                Tạo
              </button>
              <button onClick={() => setShowTaskModal(false)} className="btn-secondary">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
