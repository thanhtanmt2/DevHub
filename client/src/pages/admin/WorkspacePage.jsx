import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { workspaceApi } from '@/api/workspaceApi';
import { taskApi } from '@/api/taskApi';
import { adminApi } from '@/api/adminApi';
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
  const [evalMember, setEvalMember] = useState(null);
  const [evalForm, setEvalForm] = useState({ score: 10, comments: '' });

  const { data: wsData, isLoading: wsLoading } = useQuery({ queryKey: ['workspace', id], queryFn: () => workspaceApi.getWorkspaceDetail(id) });
  const { data: tasksData, isLoading: tasksLoading } = useQuery({ queryKey: ['workspace-tasks', id], queryFn: () => taskApi.getWorkspaceTasks(id) });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => taskApi.updateTask(taskId, data),
    onSuccess: () => qc.invalidateQueries(['workspace-tasks', id]),
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => taskApi.createTask(id, data),
    onSuccess: () => { qc.invalidateQueries(['workspace-tasks', id]); setShowTaskModal(false); toast.success('Đã tạo task'); }
  });

  const evalMutation = useMutation({
    mutationFn: (data) => adminApi.evaluateCandidate(id, evalMember.id, data),
    onSuccess: () => { setEvalMember(null); toast.success('Đã lưu đánh giá'); }
  });

  const payMutation = useMutation({
    mutationFn: (memberId) => adminApi.createPayment({ workspace_member_id: memberId, amount: 5000000, note: 'Thanh toán dự án' }),
    onSuccess: () => { toast.success('Đã tạo yêu cầu thanh toán (5tr VND)'); }
  });

  if (wsLoading || tasksLoading) return <LoadingSpinner />;
  const workspace = wsData?.data?.data;
  const tasks = tasksData?.data?.data || [];
  const members = workspace?.WorkspaceMembers || [];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (source.droppableId === destination.droppableId) return;
    updateTaskMutation.mutate({ taskId: draggableId, data: { status: destination.droppableId } });
  };

  const columns = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace?.name}</h1>
          <p className="text-gray-500 text-sm">Thành viên: {members.length}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin() && <button onClick={() => setShowTaskModal(true)} className="btn-primary">+ Thêm Task</button>}
        </div>
      </div>

      {isAdmin() && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 flex gap-4 overflow-x-auto">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
              <span className="text-sm font-medium">{m.CandidateProfile?.User?.full_name}</span>
              <button onClick={() => setEvalMember(m)} className="text-xs bg-blue-100 text-blue-700 px-2 rounded hover:bg-blue-200">Đánh giá</button>
              <button onClick={() => payMutation.mutate(m.id)} className="text-xs bg-green-100 text-green-700 px-2 rounded hover:bg-green-200">Thanh toán</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-w-max pb-4">
            {STATUS_COLUMNS.map(statusId => (
              <Droppable key={statusId} droppableId={statusId}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`bg-gray-100/50 rounded-xl p-3 w-80 flex flex-col ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center justify-between">
                      {COLUMN_LABELS[statusId]} <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">{columns[statusId].length}</span>
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {columns[statusId].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-white p-3 rounded-lg shadow-sm border ${snapshot.isDragging ? 'ring-2 ring-primary-500' : 'border-gray-100'}`}>
                              <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
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

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Thêm Task</h2>
            <div className="space-y-3">
              <input className="input-field" placeholder="Tiêu đề" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <textarea className="input-field" placeholder="Mô tả" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              <select className="input-field" value={newTask.workspace_member_id} onChange={e => setNewTask({...newTask, workspace_member_id: e.target.value})}>
                <option value="">-- Chọn người nhận --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.CandidateProfile?.User?.full_name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => createTaskMutation.mutate(newTask)} className="btn-primary">Tạo</button>
              <button onClick={() => setShowTaskModal(false)} className="btn-secondary">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {evalMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Đánh giá: {evalMember.CandidateProfile?.User?.full_name}</h2>
            <div className="space-y-3">
              <label>Điểm (0-10)</label>
              <input type="number" min="0" max="10" className="input-field" value={evalForm.score} onChange={e => setEvalForm({...evalForm, score: parseFloat(e.target.value)})} />
              <label>Nhận xét</label>
              <textarea className="input-field" rows={3} value={evalForm.comments} onChange={e => setEvalForm({...evalForm, comments: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => evalMutation.mutate(evalForm)} className="btn-primary">Lưu</button>
              <button onClick={() => setEvalMember(null)} className="btn-secondary">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
