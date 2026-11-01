import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import WorkspaceLogs from '../candidate/components/WorkspaceLogs';
import { workspaceApi } from '@/api/workspaceApi';
import { taskApi } from '@/api/taskApi';
import { uploadApi } from '@/api/uploadApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getUploadedFileName, formatFileSize } from '@/utils/fileHelper';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import { stripEmoji } from '@/utils/stripEmoji';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLUMNS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
const STATUS_META = {
  TODO:        { label: 'Cần làm',      color: 'bg-gray-100',   dot: 'bg-gray-400',   text: 'text-gray-600' },
  IN_PROGRESS: { label: 'Đang làm',     color: 'bg-primary-50',    dot: 'bg-primary-500',   text: 'text-primary-700' },
  REVIEW:      { label: 'Chờ duyệt',    color: 'bg-amber-50',   dot: 'bg-amber-500',  text: 'text-amber-700' },
  DONE:        { label: 'Hoàn thành',   color: 'bg-green-50',   dot: 'bg-green-500',  text: 'text-green-700' },
};
const PRIORITY_META = {
  URGENT: { label: 'Khẩn cấp', color: 'text-red-600 bg-red-50',     dot: 'bg-red-500', bar: 'border-l-red-500' },
  HIGH:   { label: 'Cao',      color: 'text-orange-600 bg-orange-50', dot: 'bg-orange-500', bar: 'border-l-orange-400' },
  MEDIUM: { label: 'Bình thường', color: 'text-yellow-600 bg-yellow-50', dot: 'bg-yellow-400', bar: 'border-l-amber-300' },
  LOW:    { label: 'Thấp',     color: 'text-gray-500 bg-gray-100',   dot: 'bg-gray-400', bar: 'border-l-slate-300' },
};
// Icon cho từng loại hoạt động trong tab Lịch sử của task
const ACTIVITY_ICONS = {
  STATUS_CHANGED: 'refresh',
  TASK_CREATED: 'sparkles',
  TASK_APPROVED: 'verified',
  TASK_REVISION: 'undo',
  ASSIGNED: 'user',
  SUBMITTED: 'upload',
  PROGRESS: 'trending', // nhật ký cũ (trước đây task có % tiến độ)
  UPDATED: 'pencil',
};
const LABEL_COLORS = {
  Frontend:  'bg-primary-100 text-primary-700',
  Backend:   'bg-sky-100 text-sky-700',
  Bug:       'bg-red-100 text-red-700',
  Feature:   'bg-green-100 text-green-700',
  Design:    'bg-slate-100 text-slate-700',
  Testing:   'bg-yellow-100 text-yellow-700',
  DevOps:    'bg-primary-100 text-primary-700',
  Research:  'bg-sky-50 text-sky-600',
};
const ALL_LABELS = Object.keys(LABEL_COLORS);
// Admin là chủ; Admin cử Lead để phân chia công việc, còn lại là Thành viên
const MEMBER_ROLE_LABELS = { LEAD: 'Lead', MEMBER: 'Thành viên' };
const ROLE_OPTIONS = ['LEAD', 'MEMBER'];

// Luồng trạng thái hợp lệ (khớp với backend). Ra khỏi "Chờ duyệt" chỉ qua nghiệm thu.
const TRANSITIONS = { TODO: ['IN_PROGRESS'], IN_PROGRESS: ['TODO', 'REVIEW'], REVIEW: [], DONE: [] };
// Trạng thái còn được chỉnh subtask / chuyển trạng thái
const EDITABLE_STATUSES = ['TODO', 'IN_PROGRESS'];

// Ngày hôm nay theo giờ máy (YYYY-MM-DD) cho ô chọn deadline
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Quá hạn = đã qua hết ngày deadline mà task vẫn chưa gửi duyệt
const isTaskOverdue = (task) => {
  if (!task.deadline || !EDITABLE_STATUSES.includes(task.status)) return false;
  const end = new Date(task.deadline);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
};

// Kết quả nghiệm thu của từng lần nộp sản phẩm
const SUBMISSION_STATUS = {
  PENDING_REVIEW:    { label: 'Chờ duyệt',   color: 'bg-amber-100 text-amber-700' },
  ACCEPTED:          { label: 'Đã duyệt',    color: 'bg-green-100 text-green-700' },
  REVISION_REQUIRED: { label: 'Yêu cầu sửa', color: 'bg-orange-100 text-orange-700' },
};
// File sản phẩm được phép nộp (khớp với backend)
const TASK_FILE_ACCEPT = '.zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp,.sql,.json,.fig';
const MAX_TASK_FILE_SIZE = 20 * 1024 * 1024;
const isHttpUrl = (s) => /^https?:\/\/\S+$/i.test(s.trim());
const formatDateTime = (d) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Helper: Avatar initials ──────────────────────────────────────────────────
function Avatar({ name, size = 'sm', className = '', onClick }) {
  const initials = name?.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase() || '?';
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const colors = ['bg-primary-500','bg-primary-600','bg-sky-500','bg-primary-700','bg-sky-600','bg-primary-400'];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div onClick={onClick} className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// ─── Task Card (Kanban) ───────────────────────────────────────────────────────
function TaskCard({ task, onClick, provided, snapshot, isMine }) {
  const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;
  const totalSubs = task.SubTasks?.length || 0;
  const doneSubs = task.SubTasks?.filter(s => s.is_done).length || 0;
  const isOverdue = isTaskOverdue(task);
  const needsRevision = task.status === 'IN_PROGRESS' && task.review_status === 'REVISION_REQUIRED';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      title={isMine ? 'Task của bạn' : undefined}
      className={`bg-white rounded-xl border border-gray-100 border-l-4 ${pm.bar} shadow-sm p-3 cursor-pointer
        hover:shadow-md transition-all select-none
        ${isMine ? 'ring-1 ring-primary-300' : ''}
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

      {/* Bị yêu cầu chỉnh sửa sau nghiệm thu */}
      {needsRevision && (
        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-semibold bg-orange-100 text-orange-700 mb-1.5">
          <Icon name="undo" className="w-3 h-3 mr-0.5" />Cần chỉnh sửa
        </span>
      )}

      {/* Title */}
      {/* Không gạch ngang task Hoàn thành: cột + dấu "Xong" + thẻ hơi mờ đã đủ phân biệt */}
      <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">
        {task.title}
      </p>

      {/* Priority + Deadline */}
      <div className="flex items-center gap-1.5 mb-2.5 text-xs">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${pm.color}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${pm.dot}`} />{pm.label}
        </span>
        {task.deadline && (
          <span className={`ml-auto ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
            <Icon name={isOverdue ? 'alert' : 'calendar'} className="w-3 h-3 mr-0.5" />
            {new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </span>
        )}
      </div>

      {/* Sub-task progress */}
      {totalSubs > 0 && (
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
            <span>Công việc con</span>
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
        {task.status === 'DONE' && <span className="text-[10px] text-green-500 font-semibold"><Icon name="check" className="w-3 h-3 mr-0.5" strokeWidth={2.5} />Xong</span>}
      </div>
    </div>
  );
}

// ─── Một lần nộp sản phẩm ─────────────────────────────────────────────────────
function SubmissionCard({ submission: s, highlight = false }) {
  const st = SUBMISSION_STATUS[s.review_status] || SUBMISSION_STATUS.PENDING_REVIEW;
  const fileName = getUploadedFileName(s.attachment_url);
  return (
    <div className={`rounded-lg border px-3 py-2.5 space-y-1.5 ${highlight ? 'border-amber-300 bg-amber-50/60' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="font-semibold text-gray-700">Lần #{s.version}</span>
        <span className={`px-1.5 py-0.5 rounded font-semibold ${st.color}`}>{st.label}</span>
        <span className="ml-auto text-gray-400">
          {formatDateTime(s.submitted_at)}{s.submitted_by ? ` · ${s.submitted_by}` : ''}
        </span>
      </div>
      {s.product_url && (
        <a href={s.product_url} target="_blank" rel="noopener noreferrer"
          className="flex items-start gap-1.5 text-sm text-primary-700 hover:underline break-all">
          <Icon name="link" className="w-4 h-4 mt-0.5" /><span>{s.product_url}</span>
        </a>
      )}
      {s.attachment_url && (
        <a href={s.attachment_url} target="_blank" rel="noopener noreferrer" download={fileName}
          className="flex items-start gap-1.5 text-sm text-primary-700 hover:underline break-all">
          <Icon name="paperclip" className="w-4 h-4 mt-0.5" /><span>{fileName}</span>
        </a>
      )}
      {s.note && <p className="text-sm text-gray-700 whitespace-pre-wrap">{s.note}</p>}
    </div>
  );
}

// ─── Nộp sản phẩm & gửi duyệt (Đang làm → Chờ duyệt) ─────────────────────────
function SubmitWorkModal({ task, workspaceId, nextVersion, onClose, onSubmitted }) {
  useEscapeKey(onClose);
  const qc = useQueryClient();
  const [productUrl, setProductUrl] = useState('');
  const [attachment, setAttachment] = useState(null); // { url, filename, size }
  const [note, setNote] = useState('');
  const [uploadPct, setUploadPct] = useState(null); // null = không tải; 0..100 = đang tải

  const urlInvalid = productUrl.trim() !== '' && !isHttpUrl(productUrl);
  const canSubmit = (isHttpUrl(productUrl) || !!attachment) && !urlInvalid && uploadPct === null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại đúng file đó
    if (!file) return;
    if (file.size > MAX_TASK_FILE_SIZE) { toast.error('File vượt quá dung lượng cho phép (tối đa 20MB)'); return; }
    setUploadPct(0);
    try {
      const res = await uploadApi.uploadTaskFile(file, setUploadPct);
      setAttachment(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tải file thất bại');
    } finally {
      setUploadPct(null);
    }
  };

  const submitMut = useMutation({
    mutationFn: () => taskApi.submitTask(task.id, {
      product_url: productUrl.trim() || undefined,
      attachment_url: attachment?.url,
      note: note.trim() || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId] });
      qc.invalidateQueries({ queryKey: ['task', task.id] });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['my-workspaces'] });
      toast.success('Đã nộp sản phẩm. Task chuyển sang "Chờ duyệt"');
      onSubmitted?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Nộp sản phẩm thất bại'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">Nộp sản phẩm & gửi duyệt</h2>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {task.title}{nextVersion > 1 ? ` · Lần nộp #${nextVersion}` : ''}
            </p>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="text-gray-400 hover:text-gray-600 ml-3"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            Đính kèm <b>link</b> hoặc <b>file</b> sản phẩm (ít nhất một) để Quản lý nghiệm thu.
            Sau khi nộp, task chuyển sang cột "Chờ duyệt".
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link sản phẩm</label>
            <input className={`input-field ${urlInvalid ? 'border-red-300 focus:ring-red-300' : ''}`} maxLength={500}
              placeholder="https://github.com/... hoặc link Google Drive, Figma..."
              value={productUrl} onChange={e => setProductUrl(e.target.value)} />
            {urlInvalid && <p className="text-xs text-red-500 mt-1">Link cần bắt đầu bằng http:// hoặc https://</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">File đính kèm</label>
            {attachment ? (
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                <Icon name="paperclip" className="w-4 h-4 text-primary-700" />
                <span className="text-sm text-gray-800 truncate flex-1">{attachment.filename}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(attachment.size)}</span>
                <button onClick={() => setAttachment(null)} title="Bỏ file"
                  className="text-gray-400 hover:text-red-500 px-1" aria-label="Bỏ file"><Icon name="x" className="w-4 h-4" /></button>
              </div>
            ) : uploadPct !== null ? (
              <div className="border border-gray-200 rounded-lg px-3 py-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Đang tải file lên...</span><span>{uploadPct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg px-3 py-4 cursor-pointer hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
                <span className="text-sm text-gray-600"><Icon name="upload" className="w-4 h-4 mr-1" />Chọn file để tải lên</span>
                <span className="text-[11px] text-gray-400">Tối đa 20MB · zip, rar, pdf, docx, xlsx, pptx, ảnh...</span>
                <input type="file" className="hidden" accept={TASK_FILE_ACCEPT} onChange={handleFile} />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ghi chú cho Quản lý</label>
            <textarea className="input-field resize-none text-sm" rows={3} maxLength={2000}
              placeholder="Mô tả những gì đã làm, cách kiểm tra, lưu ý..."
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-2">
          <button onClick={() => submitMut.mutate()} disabled={!canSubmit || submitMut.isPending}
            className="btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitMut.isPending ? 'Đang nộp...' : 'Nộp & gửi duyệt'}
          </button>
          <button onClick={onClose} className="btn-secondary px-5 py-2.5">Hủy</button>
        </div>
      </div>
    </div>
  );
}

// Biến các đường dẫn http(s) trong văn bản thành liên kết bấm được
function Linkified({ text, className = '' }) {
  const parts = String(text || '').split(/(https?:\/\/[^\s<>"']+)/g);
  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => (i % 2 === 1
        ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline break-all">{part}</a>
        : part))}
    </p>
  );
}

const isImageUrl = (url) => /\.(png|jpe?g|gif|webp)$/i.test(String(url || '').split('?')[0]);

// ─── Task Detail (cửa sổ rộng kiểu Jira) ─────────────────────────────────────
// Bên trái: tiêu đề, mô tả, công việc con, sản phẩm đã nộp, bình luận / lịch sử.
// Bên phải: trạng thái + thao tác chuyển trạng thái, nghiệm thu, và bảng "Chi tiết" (người làm, ưu tiên, deadline, nhãn...).

// Một dòng trong bảng "Chi tiết" (nhãn bên trái, giá trị bên phải)
function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[104px_1fr] gap-3 items-start py-2.5">
      <dt className="text-xs font-semibold text-gray-500 pt-1">{label}</dt>
      <dd className="text-sm text-gray-800 min-w-0">{children}</dd>
    </div>
  );
}

function TaskDetailDrawer({ taskId, members, canManage, onClose, workspaceId, workspaceName, workload = {}, initialReview = null }) {
  const confirm = useConfirm();
  const qc = useQueryClient();
  const { user, isAdmin } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [newSubTask, setNewSubTask] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeTab, setActiveTab] = useState('comments'); // 'all' | 'comments' | 'history'
  const [reviewNote, setReviewNote] = useState('');
  const [reviewError, setReviewError] = useState('');
  const reviewNoteRef = useRef(null);
  // Mở sẵn bảng nghiệm thu khi Quản lý kéo task ra khỏi cột "Chờ duyệt"
  const [showReviewPanel, setShowReviewPanel] = useState(!!initialReview);
  const [showSubmit, setShowSubmit] = useState(false); // form nộp sản phẩm
  const [descEditing, setDescEditing] = useState(false); // đang sửa mô tả ngay trong cửa sổ
  const [descDraft, setDescDraft] = useState('');
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [linkForm, setLinkForm] = useState(null);   // { name, url } khi đang thêm liên kết
  const [uploadPct, setUploadPct] = useState(null); // null = không tải; 0..100 = đang tải tệp
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  // Esc: thoát lần lượt từng lớp (sửa mô tả → chế độ sửa task → đóng cửa sổ)
  useEscapeKey(() => (descEditing ? setDescEditing(false) : editMode ? setEditMode(false) : onClose()));

  const { data, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 0, // mỗi lần mở đều lấy dữ liệu mới (thành viên khác có thể vừa cập nhật)
  });
  const task = data?.data?.data;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['task', taskId] });
    qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId], exact: false });
    qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    qc.invalidateQueries({ queryKey: ['my-tasks'] });
    qc.invalidateQueries({ queryKey: ['my-workspaces'] });
  };

  const updateMut = useMutation({
    mutationFn: (d) => taskApi.updateTask(taskId, d),
    onSuccess: () => { invalidate(); setEditMode(false); toast.success('Đã lưu'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Cập nhật thất bại')
  });
  const reviewMut = useMutation({
    mutationFn: (d) => taskApi.reviewTask(taskId, d),
    onSuccess: (_, vars) => {
      invalidate();
      setShowReviewPanel(false);
      setReviewNote('');
      setReviewError('');
      toast.success(vars.action === 'APPROVE' ? 'Đã duyệt task' : 'Đã yêu cầu chỉnh sửa');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });
  const addCommentMut = useMutation({
    mutationFn: (content) => taskApi.addComment(taskId, content),
    onSuccess: () => { invalidate(); setCommentText(''); },
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });
  // Yêu cầu sửa bắt buộc có nội dung: nếu chưa nhập thì báo lỗi ngay và đưa con trỏ vào ô nhập
  const requestRevision = () => {
    if (!reviewNote.trim()) {
      setReviewError('Hãy nhập nội dung cần chỉnh sửa để người làm biết phải sửa gì.');
      reviewNoteRef.current?.focus();
      return;
    }
    reviewMut.mutate({ action: 'REVISION', review_note: reviewNote.trim() });
  };
  const deleteCommentMut = useMutation({
    mutationFn: (commentId) => taskApi.deleteComment(taskId, commentId),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });
  const addSubTaskMut = useMutation({
    mutationFn: (title) => taskApi.addSubTask(taskId, title),
    onSuccess: () => { invalidate(); setNewSubTask(''); },
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });
  // Tick subtask: ô tick đổi NGAY khi bấm (state cục bộ, không chờ máy chủ); xong thì bỏ ghi đè và lấy dữ liệu thật.
  // Lỗi thì ô tick tự trở về trạng thái cũ.
  const [subOverrides, setSubOverrides] = useState({}); // subId -> is_done đang chờ máy chủ xác nhận
  const updateSubTaskMut = useMutation({
    mutationFn: ({ subId, data }) => taskApi.updateSubTask(taskId, subId, data),
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
    onSettled: async (_res, _err, { subId }) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['task', taskId] }),
        qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId], exact: false }),
        qc.invalidateQueries({ queryKey: ['workspace', workspaceId] }),
        qc.invalidateQueries({ queryKey: ['my-tasks'] }),
        qc.invalidateQueries({ queryKey: ['my-workspaces'] }),
      ]);
      setSubOverrides(o => { const n = { ...o }; delete n[subId]; return n; });
    },
  });
  const toggleSubTask = (sub) => {
    const next = !(subOverrides[sub.id] ?? sub.is_done);
    setSubOverrides(o => ({ ...o, [sub.id]: next }));
    updateSubTaskMut.mutate({ subId: sub.id, data: { is_done: next } });
  };
  const deleteSubTaskMut = useMutation({
    mutationFn: (subId) => taskApi.deleteSubTask(taskId, subId),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });
  const deleteTaskMut = useMutation({
    mutationFn: () => taskApi.deleteTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId], exact: false });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      onClose();
      toast.success('Đã xóa task');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Thao tác thất bại'),
  });

  // Sửa mô tả / nhãn / tài liệu: Admin, Lead, hoặc người được giao khi task còn đang làm
  const descMut = useMutation({
    mutationFn: (description) => taskApi.updateTask(taskId, { description }),
    onSuccess: () => { invalidate(); setDescEditing(false); toast.success('Đã cập nhật mô tả'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Cập nhật thất bại'),
  });
  const labelMut = useMutation({
    mutationFn: (labels) => taskApi.updateTask(taskId, { labels }),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.response?.data?.message || 'Cập nhật thất bại'),
  });
  const addAttachMut = useMutation({
    mutationFn: (data) => taskApi.addAttachment(taskId, data),
    onSuccess: () => { invalidate(); setLinkForm(null); toast.success('Đã thêm liên kết'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Không thêm được tài liệu'),
  });
  const deleteAttachMut = useMutation({
    mutationFn: (attId) => taskApi.deleteAttachment(taskId, attId),
    onSuccess: () => { invalidate(); toast.success('Đã gỡ tài liệu'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Không gỡ được tài liệu'),
  });
  // Tải lần lượt từng tệp lên rồi gắn vào task (chọn nhiều tệp hoặc kéo thả đều dùng hàm này)
  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    for (const file of files) {
      if (file.size > MAX_TASK_FILE_SIZE) { toast.error(`"${file.name}" vượt quá 20MB`); continue; }
      setUploadPct(0);
      try {
        const res = await uploadApi.uploadTaskFile(file, setUploadPct);
        const up = res.data.data; // { url, filename, size }
        await taskApi.addAttachment(taskId, { kind: 'FILE', url: up.url, name: up.filename, size: up.size });
        invalidate();
        toast.success(`Đã đính kèm "${up.filename}"`);
      } catch (err) {
        toast.error(err.response?.data?.message || `Không đính kèm được "${file.name}"`);
      }
    }
    setUploadPct(null);
  };

  if (!taskId) return null;

  const shell = (children) => createPortal(
    <div className="fixed inset-0 z-40 bg-black/50 flex items-stretch sm:items-center justify-center sm:p-6" onClick={() => { if (!editMode) onClose(); }}>
      <div className="bg-white w-full max-w-6xl h-full sm:h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );

  if (isLoading) return shell(<div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>);
  if (!task) return null;

  const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;
  const sm = STATUS_META[task.status] || STATUS_META.TODO;
  const subDone = (s) => subOverrides[s.id] ?? s.is_done; // gồm cả thao tác đang chờ máy chủ xác nhận
  const totalSubs = task.SubTasks?.length || 0;
  const doneSubs = task.SubTasks?.filter(subDone).length || 0;
  const pendingSubs = totalSubs - doneSubs;
  const subPercent = totalSubs ? Math.round((doneSubs / totalSubs) * 100) : 0;
  const isOverdue = isTaskOverdue(task);
  const isDone = task.status === 'DONE';
  const inRevision = task.status === 'IN_PROGRESS' && task.review_status === 'REVISION_REQUIRED';
  const myMember = members.find(m => m.CandidateProfile?.user_id === user?.id);
  const myMemberId = myMember?.id;
  const isAssignedToMe = task.Assignees?.some(a => a.id === myMemberId);
  // Admin và Lead bình luận ở mọi task; thành viên phản hồi trong task được giao cho mình, task người khác chỉ đọc
  const canComment = canManage || isAssignedToMe;
  const canReview = canManage && task.status === 'REVIEW';
  // Người thực hiện không được tự nghiệm thu task của mình (trừ Admin)
  const isSelfReview = isAssignedToMe && !isAdmin();
  // Cập nhật subtask / chuyển trạng thái khi task chưa gửi duyệt
  const canEditProgress = EDITABLE_STATUSES.includes(task.status) && (canManage || isAssignedToMe);
  // Sửa mô tả / nhãn / đính kèm tài liệu: Admin/Lead (khi chưa nghiệm thu) hoặc người được giao khi task còn đang làm
  const canEditContent = !isDone && (canManage || (isAssignedToMe && EDITABLE_STATUSES.includes(task.status)));
  const attachments = task.Attachments || [];
  const startDescEdit = () => { setDescDraft(task.description || ''); setDescEditing(true); };
  const assignableMembers = members; // mọi thành viên Workspace đều có thể được giao việc
  // Các lần nộp sản phẩm (mới nhất trước)
  const submissions = task.TaskSubmissions || [];
  const taskKey = `#${String(task.id).slice(0, 6).toUpperCase()}`;
  const myName = user?.full_name || 'Bạn';

  // Dòng thời gian: bình luận + lịch sử, mới nhất trước (giống phần Activity của Jira)
  const commentItems = (task.Comments || []).map(c => ({ kind: 'comment', id: `c-${c.id}`, at: c.created_at, c }));
  const historyItems = (task.Activities || []).map(a => ({ kind: 'activity', id: `a-${a.id}`, at: a.created_at, a }));
  const feed = (activeTab === 'comments' ? commentItems : activeTab === 'history' ? historyItems : [...commentItems, ...historyItems])
    .sort((x, y) => new Date(y.at) - new Date(x.at));

  const startEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.slice(0,10) : '',
      labels: task.labels || [],
      assignee_ids: task.Assignees?.map(a => a.id) || [],
    });
    setEditMode(true);
  };
  // Task đã bắt đầu làm thì phải còn ít nhất 1 người thực hiện
  const editMissingAssignee = editData && task.status !== 'TODO' && !editData.assignee_ids.length;

  // ── Thanh trên cùng ──
  const topBar = (
    <div className="flex items-center gap-3 px-5 py-3 border-b bg-white flex-shrink-0">
      <div className="min-w-0 flex items-center gap-2 text-sm text-gray-500">
        <Icon name="clipboard" className="w-4 h-4 text-primary-700 flex-shrink-0" />
        <span className="truncate">{workspaceName || 'Workspace'}</span>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-700">{taskKey}</span>
      </div>
      <div className="flex-1" />
      {/* Task đã nghiệm thu thì khóa, không sửa/xóa */}
      {isDone && <span className="text-xs text-gray-400"><Icon name="lock" className="w-3.5 h-3.5 mr-1" />Đã nghiệm thu</span>}
      {canManage && !isDone && !editMode && (
        <button onClick={startEdit} className="inline-flex items-center whitespace-nowrap text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200">
          <Icon name="pencil" className="w-4 h-4 mr-1" />Sửa
        </button>
      )}
      {canManage && !isDone && !editMode && (
        <button onClick={async () => { if (await confirm({ title: 'Xóa task', message: 'Xóa task này? Thao tác không thể hoàn tác.', confirmText: 'Xóa task', tone: 'danger' })) deleteTaskMut.mutate(); }}
          className="inline-flex items-center whitespace-nowrap text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-100">
          <Icon name="trash" className="w-4 h-4 mr-1" />Xóa
        </button>
      )}
      <button onClick={onClose} aria-label="Đóng" className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
        <Icon name="x" className="w-5 h-5" />
      </button>
    </div>
  );

  // ── Chế độ sửa ──
  if (editMode && editData) {
    return shell(
      <>
        {topBar}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <h2 className="font-bold text-gray-800 text-lg">Chỉnh sửa task</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Tiêu đề</label>
                <input className="input-field text-base" maxLength={255} value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Mô tả</label>
                <textarea className="input-field resize-y" rows={10} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Độ ưu tiên</label>
                  <select className="input-field text-sm" value={editData.priority} onChange={e => setEditData({...editData, priority: e.target.value})}>
                    {Object.entries(PRIORITY_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Deadline</label>
                  <input type="date" className="input-field text-sm" value={editData.deadline} min={todayStr()}
                    onChange={e => setEditData({...editData, deadline: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nhãn</label>
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
                {editMissingAssignee && (
                  <p className="text-xs text-red-500 mb-1.5">Task đã bắt đầu làm nên phải có ít nhất một người thực hiện</p>
                )}
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {assignableMembers.map(m => {
                    const name = m.CandidateProfile?.User?.full_name;
                    const checked = editData.assignee_ids.includes(m.id);
                    return (
                      <label key={m.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-all ${checked ? 'bg-primary-50 border-primary-200' : 'border-transparent hover:bg-gray-50'}`}>
                        <input type="checkbox" className="rounded" checked={checked}
                          onChange={() => setEditData(d => ({...d, assignee_ids: checked ? d.assignee_ids.filter(id => id !== m.id) : [...d.assignee_ids, m.id]}))} />
                        <Avatar name={name} size="sm" />
                        <span className="text-sm text-gray-800">{name}</span>
                        <span className="ml-auto text-[10px] text-gray-400">{MEMBER_ROLE_LABELS[m.role]} · {workload?.[m.id] || 0} task</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-3 flex justify-end gap-2">
          <button onClick={() => setEditMode(false)} className="btn-secondary px-5 py-2">Hủy</button>
          <button onClick={() => updateMut.mutate(editData)} disabled={updateMut.isPending || !editData.title.trim() || editMissingAssignee}
            className="btn-primary px-6 py-2">
            {updateMut.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </>
    );
  }

  // ── Chế độ xem ──
  return shell(
    <>
      {topBar}

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* ───────── Cột trái: nội dung ───────── */}
        <div className="flex-1 min-w-0 lg:overflow-y-auto px-6 py-5 space-y-7">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{task.title}</h1>

          {/* Yêu cầu chỉnh sửa sau nghiệm thu: đặt ngay đầu để người làm thấy trước tiên */}
          {inRevision && task.review_note && (
            <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3">
              <p className="text-sm font-semibold text-orange-700 mb-1"><Icon name="pencil" className="w-4 h-4 mr-1" />Quản lý yêu cầu chỉnh sửa</p>
              <p className="text-sm text-orange-800 whitespace-pre-wrap">"{task.review_note}"</p>
              <p className="text-[11px] text-orange-500 mt-1.5">
                {task.reviewed_at ? `${formatDateTime(task.reviewed_at)} · ` : ''}Hãy chỉnh sửa theo yêu cầu rồi nộp lại sản phẩm.
              </p>
            </div>
          )}

          {/* Mô tả: người được giao và Admin/Lead sửa trực tiếp ngay tại đây (như Jira) */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">Mô tả</h3>
              {canEditContent && !descEditing && (
                <button onClick={startDescEdit} className="text-xs text-primary-700 font-medium hover:underline inline-flex items-center gap-1">
                  <Icon name="pencil" className="w-3.5 h-3.5" />{task.description ? 'Chỉnh sửa' : 'Thêm mô tả'}
                </button>
              )}
            </div>
            {descEditing ? (
              <div>
                <textarea autoFocus className="input-field resize-y text-sm leading-relaxed" rows={9} maxLength={20000}
                  placeholder={'Ghi rõ yêu cầu, cách làm, link tài liệu... (đường dẫn http/https sẽ tự thành liên kết)'}
                  value={descDraft} onChange={e => setDescDraft(e.target.value)} />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setDescEditing(false)} className="btn-secondary text-sm px-4 py-1.5">Hủy</button>
                  <button onClick={() => descMut.mutate(descDraft)} disabled={descMut.isPending || descDraft === (task.description || '')}
                    className="btn-primary text-sm px-5 py-1.5">
                    {descMut.isPending ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            ) : task.description ? (
              <div onDoubleClick={canEditContent ? startDescEdit : undefined} title={canEditContent ? 'Nhấp đúp để chỉnh sửa' : undefined}>
                <Linkified text={task.description} className="text-sm text-gray-700 leading-relaxed" />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Chưa có mô tả{canEditContent ? ' — bấm "Thêm mô tả" để ghi yêu cầu, hướng làm hoặc link tài liệu.' : '.'}
              </p>
            )}
          </section>

          {/* Tệp đính kèm: tài liệu, bản nháp, ảnh chụp... bổ sung trong lúc làm (khác với "Sản phẩm đã nộp" để nghiệm thu) */}
          <section
            onDragOver={canEditContent ? (e) => { e.preventDefault(); setDragOver(true); } : undefined}
            onDragLeave={canEditContent ? () => setDragOver(false) : undefined}
            onDrop={canEditContent ? (e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); } : undefined}
            className={`rounded-xl transition-colors ${dragOver ? 'bg-primary-50 ring-2 ring-primary-300 ring-offset-4' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Tệp đính kèm {attachments.length > 0 && <span className="font-medium text-gray-500">({attachments.length})</span>}
              </h3>
              {canEditContent && (
                <div className="flex items-center gap-2">
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadPct !== null}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1 disabled:opacity-50">
                    <Icon name="upload" className="w-3.5 h-3.5" />Tải tệp lên
                  </button>
                  <button onClick={() => setLinkForm(linkForm ? null : { name: '', url: '' })}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1">
                    <Icon name="link" className="w-3.5 h-3.5" />Thêm liên kết
                  </button>
                  <input ref={fileInputRef} type="file" multiple className="hidden" accept={TASK_FILE_ACCEPT}
                    onChange={(e) => { uploadFiles(e.target.files); e.target.value = ''; }} />
                </div>
              )}
            </div>

            {linkForm && canEditContent && (
              <div className="mb-3 p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <input className="input-field text-sm bg-white" placeholder="https://docs.google.com/... hoặc link Figma, GitHub..." maxLength={900}
                  autoFocus value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })} />
                <input className="input-field text-sm bg-white" placeholder="Tên hiển thị (không bắt buộc)" maxLength={200}
                  value={linkForm.name} onChange={e => setLinkForm({ ...linkForm, name: e.target.value })} />
                {linkForm.url.trim() && !isHttpUrl(linkForm.url) && <p className="text-xs text-red-500">Link cần bắt đầu bằng http:// hoặc https://</p>}
                <div className="flex justify-end gap-2">
                  <button onClick={() => setLinkForm(null)} className="btn-secondary text-xs px-3 py-1.5">Hủy</button>
                  <button
                    onClick={() => addAttachMut.mutate({ kind: 'LINK', url: linkForm.url.trim(), name: linkForm.name.trim() || undefined })}
                    disabled={!isHttpUrl(linkForm.url) || addAttachMut.isPending}
                    className="btn-primary text-xs px-4 py-1.5">
                    Thêm
                  </button>
                </div>
              </div>
            )}

            {uploadPct !== null && (
              <div className="mb-3 border border-gray-200 rounded-lg px-3 py-2.5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5"><span>Đang tải tệp lên...</span><span>{uploadPct}%</span></div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
              </div>
            )}

            {attachments.length > 0 ? (
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {attachments.map(a => {
                  const canRemove = canEditContent && (canManage || a.uploaded_by_user_id === user?.id);
                  return (
                    <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 bg-white group">
                      {a.kind === 'FILE' && isImageUrl(a.url) ? (
                        <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                          <img src={a.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                        </a>
                      ) : (
                        <span className="w-10 h-10 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                          <Icon name={a.kind === 'LINK' ? 'link' : 'paperclip'} className="w-5 h-5" />
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <a href={a.url} target="_blank" rel="noopener noreferrer" download={a.kind === 'FILE' ? a.name : undefined}
                          className="text-sm font-medium text-primary-700 hover:underline break-all">{a.name}</a>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {a.kind === 'LINK' ? 'Liên kết' : formatFileSize(a.size)}{a.size || a.kind === 'LINK' ? ' · ' : ''}
                          {a.uploaded_by_name || 'Thành viên'} · {formatDateTime(a.created_at)}
                        </p>
                      </div>
                      {canRemove && (
                        <button
                          onClick={async () => { if (await confirm({ title: 'Gỡ tài liệu', message: `Gỡ "${a.name}" khỏi task?`, confirmText: 'Gỡ', tone: 'danger' })) deleteAttachMut.mutate(a.id); }}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-1" aria-label="Gỡ tài liệu">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl px-4 py-4 text-center">
                Chưa có tài liệu đính kèm{canEditContent ? '. Kéo thả tệp vào đây, hoặc bấm "Tải tệp lên" / "Thêm liên kết".' : '.'}
              </p>
            )}
          </section>

          {/* Công việc con */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Công việc con {totalSubs > 0 && <span className="ml-1 font-medium text-gray-500">({doneSubs}/{totalSubs})</span>}
              </h3>
              {totalSubs > 0 && <span className="text-xs font-semibold text-gray-500">{subPercent}%</span>}
            </div>
            {totalSubs > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className={`h-1.5 rounded-full transition-all ${subPercent === 100 ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${subPercent}%` }} />
              </div>
            )}
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
              {task.SubTasks?.map(sub => (
                <label key={sub.id} className={`flex items-center gap-3 px-3 py-2.5 group bg-white ${canEditProgress ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}>
                  <input type="checkbox" className="rounded accent-primary-600 w-4 h-4 flex-shrink-0"
                    checked={subDone(sub)}
                    disabled={!canEditProgress}
                    onChange={() => toggleSubTask(sub)}
                  />
                  <span className={`text-sm flex-1 ${subDone(sub) ? 'line-through text-gray-400' : 'text-gray-800'}`}>{sub.title}</span>
                  {canEditProgress && (
                    <button type="button"
                      onClick={async (e) => { e.preventDefault(); if (await confirm({ title: 'Xóa công việc con', message: `Xóa "${sub.title}"?`, confirmText: 'Xóa', tone: 'danger' })) deleteSubTaskMut.mutate(sub.id); }}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity px-1" aria-label="Xóa công việc con">
                      <Icon name="x" className="w-4 h-4" />
                    </button>
                  )}
                </label>
              ))}
              {!totalSubs && <p className="px-3 py-3 text-sm text-gray-400 bg-white">Chưa có công việc con.</p>}
              {canEditProgress && (
                <div className="flex gap-2 p-2 bg-gray-50">
                  <input className="input-field py-1.5 text-sm flex-1 bg-white" placeholder="Thêm công việc con rồi nhấn Enter..." maxLength={255}
                    value={newSubTask} onChange={e => setNewSubTask(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newSubTask.trim() && !addSubTaskMut.isPending) { addSubTaskMut.mutate(newSubTask.trim()); } }}
                  />
                  <button onClick={() => newSubTask.trim() && addSubTaskMut.mutate(newSubTask.trim())}
                    disabled={addSubTaskMut.isPending || !newSubTask.trim()}
                    className="btn-secondary px-4 py-1.5 text-sm">
                    Thêm
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Sản phẩm đã nộp (mới nhất trước) */}
          {submissions.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Sản phẩm đã nộp <span className="font-medium text-gray-500">({submissions.length})</span></h3>
              <div className="space-y-2">
                {submissions.map((s, i) => (
                  <SubmissionCard key={s.id} submission={s} highlight={i === 0 && task.status === 'REVIEW'} />
                ))}
              </div>
            </section>
          )}

          {/* Hoạt động: bình luận + lịch sử */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Hoạt động</h3>
            <div className="flex gap-1 mb-4">
              {[
                ['all', 'Tất cả'],
                ['comments', `Bình luận (${task.Comments?.length || 0})`],
                ['history', 'Lịch sử'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Ô viết bình luận ở trên cùng; Admin/Lead: mọi task. Thành viên: chỉ task được giao cho mình */}
            {activeTab !== 'history' && (canComment ? (
              <div className="flex gap-3 mb-5">
                <Avatar name={myName} size="sm" className="mt-1" />
                <div className="flex-1">
                  <textarea className="input-field resize-none text-sm w-full" rows={2} maxLength={5000}
                    placeholder="Viết bình luận... (Enter để gửi, Shift+Enter xuống dòng)"
                    value={commentText} onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && commentText.trim() && !addCommentMut.isPending) { e.preventDefault(); addCommentMut.mutate(commentText.trim()); } }}
                  />
                  {commentText.trim() && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setCommentText('')} className="btn-secondary text-xs px-3 py-1.5">Hủy</button>
                      <button onClick={() => addCommentMut.mutate(commentText.trim())} disabled={addCommentMut.isPending} className="btn-primary text-xs px-4 py-1.5">Gửi</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-5">
                Bạn chỉ bình luận được trong task được giao cho mình. Bạn vẫn xem được các bình luận.
              </p>
            ))}

            <div className="space-y-4">
              {feed.map(item => {
                if (item.kind === 'comment') {
                  const c = item.c;
                  // Bình luận của Admin không gắn với thành viên Workspace → lấy tên từ tài khoản
                  const isAdminComment = !c.workspace_member_id;
                  const authorName = c.Author?.CandidateProfile?.User?.full_name || c.AuthorUser?.full_name || 'Quản trị viên';
                  const canDeleteComment = c.user_id === user?.id || c.workspace_member_id === myMemberId || canManage;
                  return (
                    <div key={item.id} className="flex gap-3 group">
                      <Avatar name={authorName} size="sm" className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm">{authorName}</span>
                          {isAdminComment && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-100 text-primary-700">Quản trị viên</span>}
                          <span className="text-gray-400">{formatDateTime(c.created_at)}</span>
                          {canDeleteComment && (
                            <button onClick={async () => { if (await confirm({ title: 'Xóa bình luận', message: 'Xóa bình luận này?', confirmText: 'Xóa', tone: 'danger' })) deleteCommentMut.mutate(c.id); }}
                              className="ml-auto text-[11px] text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              Xóa
                            </button>
                          )}
                        </p>
                        <Linkified text={c.content} className="text-sm text-gray-700 mt-0.5" />
                      </div>
                    </div>
                  );
                }
                const a = item.a;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name={ACTIVITY_ICONS[a.action] || 'document'} className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm text-gray-700">{stripEmoji(a.description)}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {/* Không gắn thành viên = thao tác của Admin */}
                        {a.Actor?.CandidateProfile?.User?.full_name || 'Quản trị viên'} · {formatDateTime(a.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {!feed.length && (
                <p className="text-center text-sm text-gray-400 py-4">
                  {activeTab === 'history' ? 'Chưa có hoạt động nào' : activeTab === 'comments' ? 'Chưa có bình luận nào' : 'Chưa có bình luận hay hoạt động nào'}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* ───────── Cột phải: trạng thái + chi tiết ───────── */}
        <aside className="lg:w-[380px] lg:flex-shrink-0 lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50/70 p-5 space-y-5">
          {/* Trạng thái & thao tác */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${sm.text} ${sm.color} border border-white/60 shadow-sm`}>
                <span className={`w-2 h-2 rounded-full ${sm.dot}`} />{sm.label}
              </span>
              {inRevision && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700">
                  <Icon name="undo" className="w-3.5 h-3.5" />Cần chỉnh sửa
                </span>
              )}
            </div>

            {/* Cần làm → Đang làm → Chờ duyệt (→ Quản lý nghiệm thu) */}
            {canEditProgress && task.status === 'TODO' && (task.Assignees?.length ? (
              <button onClick={() => updateMut.mutate({ status: 'IN_PROGRESS' })} disabled={updateMut.isPending}
                className="w-full btn-primary py-2.5 justify-center">
                <Icon name="play" className="w-4 h-4" />Bắt đầu làm
              </button>
            ) : (
              <p className="text-xs text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg px-3 py-2">Cần giao người thực hiện trước khi bắt đầu</p>
            ))}
            {canEditProgress && task.status === 'IN_PROGRESS' && (
              <div className="space-y-2">
                <button onClick={() => setShowSubmit(true)}
                  disabled={pendingSubs > 0 || updateMut.isPending}
                  title={pendingSubs > 0 ? `Còn ${pendingSubs} công việc con chưa hoàn thành` : undefined}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm bg-green-500 text-white hover:bg-green-600 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Icon name="upload" className="w-4 h-4" />Nộp sản phẩm & gửi duyệt
                </button>
                {pendingSubs > 0 && (
                  <p className="text-xs text-gray-500">Hoàn thành {pendingSubs} công việc con còn lại để gửi duyệt.</p>
                )}
                <button onClick={() => updateMut.mutate({ status: 'TODO' })} disabled={updateMut.isPending}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors">
                  <Icon name="undo" className="w-4 h-4" />Trả về "Cần làm"
                </button>
              </div>
            )}
            {task.status === 'REVIEW' && !canManage && (
              <p className="text-sm text-amber-700 font-medium bg-amber-50 px-3 py-2.5 rounded-lg border border-amber-200">
                <Icon name="clock" className="w-4 h-4 mr-1" />Đang chờ Quản lý duyệt...
              </p>
            )}
            {isDone && (
              <p className="text-sm text-green-700 font-medium bg-green-50 px-3 py-2.5 rounded-lg border border-green-200">
                <Icon name="verified" className="w-4 h-4 mr-1" />Task đã được nghiệm thu hoàn thành
              </p>
            )}
          </div>

          {/* Nghiệm thu (Admin / Lead) */}
          {canReview && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <p className="text-sm font-semibold text-amber-800 mb-1"><Icon name="clock" className="w-4 h-4 mr-1" />Chờ nghiệm thu</p>
              <p className="text-xs text-amber-700 mb-3">
                {submissions.length
                  ? `Kiểm tra sản phẩm nộp lần #${submissions[0].version} ở mục "Sản phẩm đã nộp" trước khi nghiệm thu.`
                  : 'Task này chưa có sản phẩm đính kèm.'}
              </p>
              {isSelfReview ? (
                <p className="text-xs text-amber-700">Bạn là người thực hiện task này nên không thể tự nghiệm thu. Admin hoặc Lead khác sẽ duyệt.</p>
              ) : !showReviewPanel ? (
                <button onClick={() => setShowReviewPanel(true)} className="btn-primary w-full text-sm py-2 justify-center">Nghiệm thu task này</button>
              ) : (
                <div className="space-y-2">
                  <textarea ref={reviewNoteRef}
                    className={`input-field resize-none text-sm bg-white ${reviewError ? 'border-red-400 focus:ring-red-300' : ''}`}
                    rows={3} autoFocus={initialReview === 'REVISION'}
                    placeholder={initialReview === 'REVISION' ? 'Nhập nội dung cần chỉnh sửa...' : 'Nhận xét (bắt buộc khi yêu cầu sửa)...'}
                    value={reviewNote}
                    onChange={e => { setReviewNote(e.target.value); if (reviewError) setReviewError(''); }} />
                  {reviewError && <p className="text-xs text-red-600 font-medium"><Icon name="alert" className="w-3.5 h-3.5 mr-1" />{reviewError}</p>}
                  <button onClick={() => reviewMut.mutate({ action: 'APPROVE', review_note: reviewNote.trim() })}
                    disabled={reviewMut.isPending}
                    className="btn-primary bg-green-600 hover:bg-green-700 w-full py-2 text-sm justify-center">
                    <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />Duyệt hoàn thành
                  </button>
                  {/* Không khóa nút khi chưa nhập: bấm vào sẽ báo rõ cần nhập nội dung và đưa con trỏ vào ô nhập */}
                  <button onClick={requestRevision}
                    disabled={reviewMut.isPending}
                    className="btn-secondary text-amber-700 border-amber-300 w-full py-2 text-sm justify-center">
                    <Icon name="undo" className="w-4 h-4" />Yêu cầu sửa
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bảng chi tiết */}
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-2">
            <h3 className="text-sm font-bold text-gray-900 pt-2 pb-1">Chi tiết</h3>
            <dl className="divide-y divide-gray-100">
              <DetailRow label="Người thực hiện">
                {task.Assignees?.length > 0 ? (
                  <div className="space-y-2">
                    {task.Assignees.map(a => (
                      <div key={a.id} className="flex items-center gap-2">
                        <Avatar name={a.CandidateProfile?.User?.full_name} size="sm" />
                        <span className="flex-1 min-w-0 break-words">{a.CandidateProfile?.User?.full_name}</span>
                        {a.role === 'LEAD' && <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded flex-shrink-0">Lead</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-gray-400">Chưa giao</span>
                    {myMemberId && task.status === 'TODO' && (
                      <button onClick={() => updateMut.mutate({ assignee_ids: [myMemberId] })} disabled={updateMut.isPending}
                        className="text-xs bg-white border shadow-sm px-2.5 py-1 rounded hover:bg-gray-50 font-medium text-gray-700">
                        {updateMut.isPending ? '...' : 'Nhận việc này'}
                      </button>
                    )}
                  </div>
                )}
                {canManage && !isDone && (
                  <button onClick={() => setIsAssigning(v => !v)} className="mt-2 text-xs text-primary-700 font-medium hover:underline">
                    {isAssigning ? 'Đóng' : '+ Giao việc'}
                  </button>
                )}
                {isAssigning && canManage && !isDone && (
                  <div className="mt-2 space-y-1 p-2 bg-gray-50 rounded-lg border max-h-56 overflow-y-auto">
                    {assignableMembers.map(m => {
                      const name = m.CandidateProfile?.User?.full_name;
                      const isAssigned = task.Assignees?.some(a => a.id === m.id);
                      // Task đã bắt đầu làm thì không được bỏ người thực hiện cuối cùng
                      const isLastAssignee = isAssigned && task.Assignees.length === 1 && task.status !== 'TODO';
                      return (
                        <label key={m.id} title={isLastAssignee ? 'Task đang thực hiện phải có ít nhất một người thực hiện' : undefined}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${isAssigned ? 'bg-primary-50' : 'hover:bg-white'}`}>
                          <input type="checkbox" className="rounded accent-primary-600" checked={isAssigned}
                            disabled={isLastAssignee || updateMut.isPending}
                            onChange={() => {
                              const newIds = isAssigned
                                ? task.Assignees.filter(a => a.id !== m.id).map(a => a.id)
                                : [...(task.Assignees?.map(a => a.id) || []), m.id];
                              updateMut.mutate({ assignee_ids: newIds });
                            }}
                          />
                          <Avatar name={name} size="sm" />
                          <span className="text-sm text-gray-800 flex-1 truncate">{name}</span>
                          <span className="text-[10px] text-gray-400">{workload?.[m.id] || 0} task</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </DetailRow>

              <DetailRow label="Ưu tiên">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${pm.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{pm.label}
                </span>
              </DetailRow>

              <DetailRow label="Deadline">
                {task.deadline ? (
                  <span className={`inline-flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    <Icon name={isOverdue ? 'alert' : 'calendar'} className="w-4 h-4" />
                    {new Date(task.deadline).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {isOverdue && <span className="text-xs font-semibold bg-red-50 px-1.5 py-0.5 rounded">Quá hạn</span>}
                  </span>
                ) : <span className="text-gray-400">Không có</span>}
              </DetailRow>

              <DetailRow label="Nhãn">
                {task.labels?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map(l => (
                      <span key={l} className={`text-xs px-2 py-0.5 rounded font-medium ${LABEL_COLORS[l] || 'bg-gray-100 text-gray-600'}`}>{l}</span>
                    ))}
                  </div>
                ) : <span className="text-gray-400">Không có</span>}
                {canEditContent && (
                  <button onClick={() => setShowLabelPicker(v => !v)} className="mt-1.5 text-xs text-primary-700 font-medium hover:underline">
                    {showLabelPicker ? 'Xong' : 'Sửa nhãn'}
                  </button>
                )}
                {showLabelPicker && canEditContent && (
                  <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-gray-50 rounded-lg border">
                    {ALL_LABELS.map(l => {
                      const on = task.labels?.includes(l);
                      return (
                        <button key={l} type="button" disabled={labelMut.isPending}
                          onClick={() => labelMut.mutate(on ? task.labels.filter(x => x !== l) : [...(task.labels || []), l])}
                          className={`text-xs px-2 py-1 rounded-full border transition-all ${on ? LABEL_COLORS[l] + ' border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}>
                          {l}
                        </button>
                      );
                    })}
                  </div>
                )}
              </DetailRow>

              {totalSubs > 0 && (
                <DetailRow label="Công việc con">
                  <span className="font-medium">{doneSubs}/{totalSubs} hoàn thành</span>
                </DetailRow>
              )}
              {submissions.length > 0 && (
                <DetailRow label="Số lần nộp">
                  <span className="font-medium">{submissions.length} lần</span>
                </DetailRow>
              )}
            </dl>
          </div>

          <div className="text-[11px] text-gray-400 space-y-0.5 px-1">
            {(task.created_at || task.createdAt) && <p>Tạo lúc {formatDateTime(task.created_at || task.createdAt)}</p>}
            {(task.updated_at || task.updatedAt) && <p>Cập nhật lúc {formatDateTime(task.updated_at || task.updatedAt)}</p>}
          </div>
        </aside>
      </div>

      {/* Form nộp sản phẩm & gửi duyệt */}
      {showSubmit && (
        <SubmitWorkModal
          task={task}
          workspaceId={workspaceId}
          nextVersion={submissions.length + 1}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => setShowSubmit(false)}
        />
      )}
    </>
  );
}

// ─── Create Task Modal ────────────────────────────────────────────────────────
function CreateTaskModal({ workspaceId, members, workload = {}, onClose, onCreated }) {
  useEscapeKey(onClose);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'MEDIUM', deadline: '',
    labels: [], assignee_ids: [], sub_tasks: []
  });
  const [subInput, setSubInput] = useState('');
  const qc = useQueryClient();
  const { isAdmin } = useAuth();

  const createMut = useMutation({
    mutationFn: (data) => taskApi.createTask(workspaceId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace-tasks', workspaceId] });
      toast.success('Đã tạo task!');
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
          <h2 className="text-lg font-bold text-gray-900">Tạo Task Mới</h2>
          <button onClick={onClose} aria-label="Đóng" className="text-gray-400 hover:text-gray-600"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tiêu đề *</label>
            <input className="input-field" placeholder="VD: Thiết kế màn hình Login" maxLength={255}
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            <p className="text-[11px] text-gray-400 mt-1">Task mới sẽ nằm ở cột "Cần làm"</p>
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
                {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Deadline</label>
              <input type="date" className="input-field text-sm" value={form.deadline}
                min={todayStr()}
                onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
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
              {/* Thành viên vai trò "Xem" không được giao task */}
              {members.map(m => {
                const name = m.CandidateProfile?.User?.full_name;
                const checked = form.assignee_ids.includes(m.id);
                return (
                  <label key={m.id} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border transition-all ${checked ? 'bg-primary-50 border-primary-200' : 'border-transparent hover:bg-gray-50'}`}>
                    <input type="checkbox" className="rounded accent-primary-600" checked={checked}
                      onChange={() => setForm(f => ({ ...f, assignee_ids: checked ? f.assignee_ids.filter(id => id !== m.id) : [...f.assignee_ids, m.id] }))} />
                    <Avatar name={name} size="sm" />
                    <span className="text-sm text-gray-800 flex-1">{name}</span>
                    <span className="text-[10px] text-gray-400">{MEMBER_ROLE_LABELS[m.role]} · {workload?.[m.id] || 0} task</span>
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
                  <span className="w-3.5 h-3.5 rounded border border-gray-300 inline-block flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{st}</span>
                  <button onClick={() => setForm(f => ({ ...f, sub_tasks: f.sub_tasks.filter((_, j) => j !== i) }))}
                    className="text-gray-300 hover:text-red-400" aria-label="Xóa subtask"><Icon name="x" className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input-field py-1.5 text-sm flex-1" placeholder="Thêm subtask..." maxLength={255}
                value={subInput} onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSub()} />
              <button onClick={addSub} className="btn-secondary px-3 text-sm">+</button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex gap-2">
          <button onClick={() => createMut.mutate({ ...form, title: form.title.trim() })} disabled={!form.title.trim() || createMut.isPending}
            className="btn-primary flex-1 py-2.5">
            {createMut.isPending ? 'Đang tạo...' : 'Tạo Task'}
          </button>
          <button onClick={onClose} className="btn-secondary px-5 py-2.5">Hủy</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main WorkspacePage ───────────────────────────────────────────────────────
export default function WorkspacePage() {
  const confirm = useConfirm();
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const qc = useQueryClient();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [activeSection, setActiveSection] = useState('board'); // 'board' | 'stats' | 'members'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [reviewIntent, setReviewIntent] = useState(null); // 'APPROVE' | 'REVISION' khi kéo task ra khỏi "Chờ duyệt"
  const [filters, setFilters] = useState({ priority: '', assignee_id: '', label: '' });
  const [draggingTask, setDraggingTask] = useState(null);
  const [submitTarget, setSubmitTarget] = useState(null); // task đang mở form nộp sản phẩm (khi kéo sang "Chờ duyệt")
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: wsData, isLoading: wsLoading, error: wsError } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceApi.getWorkspaceDetail(id),
    retry: false, // không có quyền / không tồn tại thì báo ngay
  });

  // Luôn lấy toàn bộ task rồi lọc ở client: số liệu tổng không đổi theo bộ lọc
  // và thứ tự kéo thả được tính trên cả cột (kể cả task đang bị lọc ẩn)
  const tasksQueryKey = ['workspace-tasks', id];
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: tasksQueryKey,
    queryFn: () => taskApi.getWorkspaceTasks(id),
    enabled: !wsError,
    staleTime: 0,               // thành viên khác có thể vừa cập nhật bảng
    refetchOnWindowFocus: true, // quay lại tab là thấy bảng mới nhất
  });

  const workspace = wsData?.data?.data;
  const members = workspace?.WorkspaceMembers?.filter(m => m.status === 'ACTIVE') || [];
  const allTasks = tasksData?.data?.data || [];
  const myMember = members.find(m => m.CandidateProfile?.user_id === user?.id);
  const canManage = isAdmin() || myMember?.role === 'LEAD'; // Admin (chủ) hoặc Lead
  const isMine = (task) => !!myMember && task.Assignees?.some(a => a.id === myMember.id);
  // Số task đang thực hiện (chưa nghiệm thu, chưa hủy) của từng thành viên — giúp Lead/Admin chia việc đều
  const workload = {};
  allTasks.forEach(t => {
    if (t.status === 'DONE' || t.status === 'CANCELLED') return;
    t.Assignees?.forEach(a => { workload[a.id] = (workload[a.id] || 0) + 1; });
  });
  const myOpenTaskCount = allTasks.filter(t => t.status !== 'DONE' && isMine(t)).length;

  // Mở thẳng task từ link (thông báo, trang "Dự án của tôi"): /workspaces/:id?task=<taskId>
  const taskParam = searchParams.get('task');
  useEffect(() => {
    if (!taskParam || !tasksData) return;
    const list = tasksData?.data?.data || [];
    if (list.some(t => t.id === taskParam)) setSelectedTaskId(taskParam);
    else toast.error('Task không còn tồn tại hoặc đã bị xóa');
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.delete('task'); return p; }, { replace: true });
  }, [taskParam, tasksData, setSearchParams]);

  const { data: statsData } = useQuery({
    queryKey: ['workspace-stats', id],
    queryFn: () => workspaceApi.getWorkspaceStats(id),
    enabled: activeSection === 'stats',
    staleTime: 0,
  });
  const wsStats = statsData?.data?.data;

  // Quyền đổi vai trò / xóa thành viên (khớp với kiểm tra ở backend)
  const canManageMembers = isAdmin(); // chỉ Admin thêm/xóa thành viên, cử/gỡ Lead
  const [showAddMember, setShowAddMember] = useState(false);

  const updateRoleMut = useMutation({
    mutationFn: ({ memberId, role }) => workspaceApi.updateMemberRole(id, memberId, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspace', id] }); toast.success('Đã cập nhật vai trò'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Cập nhật vai trò thất bại'),
  });
  const removeMemberMut = useMutation({
    mutationFn: (memberId) => workspaceApi.removeMember(id, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', id] });
      qc.invalidateQueries({ queryKey: ['workspace-eligible', id] });
      toast.success('Đã xóa thành viên');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Xóa thành viên thất bại'),
  });

  const { data: eligibleData, isLoading: eligibleLoading } = useQuery({
    queryKey: ['workspace-eligible', id],
    queryFn: () => workspaceApi.getEligibleCandidates(id),
    enabled: isAdmin() && showAddMember,
  });
  const eligibleCandidates = eligibleData?.data?.data || [];

  const addMemberMut = useMutation({
    mutationFn: (c) => workspaceApi.addMember(id, { candidate_profile_id: c.candidate_profile_id, project_job_id: c.project_job_id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspace', id] });
      qc.invalidateQueries({ queryKey: ['workspace-eligible', id] });
      toast.success('Đã thêm thành viên vào Workspace');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Thêm thành viên thất bại'),
  });

  // Filter tasks (lọc ở client)
  const filteredTasks = allTasks.filter(t => {
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.label && !t.labels?.includes(filters.label)) return false;
    if (filters.assignee_id === '__unassigned') return !t.Assignees?.length;
    if (filters.assignee_id && !t.Assignees?.some(a => a.id === filters.assignee_id)) return false;
    return true;
  });

  // Stats (trên toàn bộ task, không phụ thuộc bộ lọc)
  const activeTasks = allTasks.filter(t => t.status !== 'CANCELLED');
  const stats = {
    total: activeTasks.length,
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: allTasks.filter(t => t.status === 'DONE').length,
    overdue: allTasks.filter(isTaskOverdue).length,
  };

  // Group by status for kanban
  const columns = STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(t => t.status === status);
    return acc;
  }, {});

  // ─── Quy tắc kéo thả ───
  // Ai được kéo task này
  const canDragTask = (task) => {
    if (task.status === 'DONE') return false;               // đã nghiệm thu → khóa
    if (canManage) return true;
    if (task.status === 'REVIEW') return false;             // đang chờ Quản lý duyệt
    return !!myMember && task.Assignees?.some(a => a.id === myMember.id);
  };
  // Task được thả vào cột nào
  const canDropTo = (task, toStatus) => {
    if (task.status === toStatus) return canManage;          // sắp xếp thứ tự trong cột: chỉ Quản lý
    if (task.status === 'REVIEW') return canManage && ['DONE', 'IN_PROGRESS'].includes(toStatus); // → mở bảng nghiệm thu
    if (!TRANSITIONS[task.status]?.includes(toStatus)) return false;
    if (toStatus !== 'TODO' && !task.Assignees?.length) return false; // chưa giao thì chỉ ở "Cần làm"
    if (toStatus === 'REVIEW' && task.SubTasks?.some(s => !s.is_done)) return false; // còn subtask chưa xong
    return true;
  };

  const onDragStart = ({ draggableId }) => setDraggingTask(allTasks.find(t => t.id === draggableId) || null);

  const onDragEnd = async (result) => {
    setDraggingTask(null);
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = allTasks.find(t => t.id === draggableId);
    if (!task) return;
    const toStatus = destination.droppableId;

    // Kéo ra khỏi "Chờ duyệt" = nghiệm thu → mở bảng duyệt để Quản lý xác nhận/nhập nhận xét
    if (task.status === 'REVIEW' && toStatus !== 'REVIEW') {
      if (canManage) {
        setReviewIntent(toStatus === 'DONE' ? 'APPROVE' : 'REVISION');
        setSelectedTaskId(task.id);
      }
      return;
    }
    if (!canDropTo(task, toStatus)) return;

    // Kéo sang "Chờ duyệt" = nộp sản phẩm → mở form nộp (task chỉ chuyển cột sau khi nộp xong)
    if (toStatus === 'REVIEW') {
      setSubmitTarget(task);
      return;
    }

    // Vị trí trong toàn bộ cột đích (kể cả task đang bị bộ lọc ẩn)
    const anchor = columns[toStatus].filter(t => t.id !== task.id)[destination.index]; // task đứng ngay sau
    const fullColumn = allTasks.filter(t => t.status === toStatus && t.id !== task.id);
    const position = anchor ? fullColumn.findIndex(t => t.id === anchor.id) : fullColumn.length;

    // Cập nhật giao diện ngay, lỗi thì hoàn tác
    await qc.cancelQueries({ queryKey: tasksQueryKey });
    const previous = qc.getQueryData(tasksQueryKey);
    qc.setQueryData(tasksQueryKey, (old) => {
      const list = old?.data?.data;
      if (!list) return old;
      const rest = list.filter(t => t.id !== task.id);
      let insertAt = anchor ? rest.findIndex(t => t.id === anchor.id) : -1;
      if (insertAt === -1) {
        const lastInColumn = rest.map(t => t.status).lastIndexOf(toStatus);
        insertAt = lastInColumn === -1 ? rest.length : lastInColumn + 1;
      }
      rest.splice(insertAt, 0, { ...task, status: toStatus });
      return { ...old, data: { ...old.data, data: rest } };
    });

    try {
      await taskApi.updateTask(task.id, task.status === toStatus ? { position } : { status: toStatus, position });
    } catch (e) {
      qc.setQueryData(tasksQueryKey, previous);
      toast.error(e.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      qc.invalidateQueries({ queryKey: tasksQueryKey });
      qc.invalidateQueries({ queryKey: ['task', task.id] });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
    }
  };

  // Trang quay lại: Admin → Dự án nội bộ, ứng viên → Dự án của tôi
  const backLink = isAdmin()
    ? { to: '/admin/projects', label: 'Dự án nội bộ' }
    : { to: '/candidate/workspaces', label: 'Dự án của tôi' };

  if (wsLoading) return <LoadingSpinner />;

  // Không có quyền (đã rời dự án...) hoặc Workspace không tồn tại
  if (wsError || !workspace) {
    const notFound = wsError?.response?.status === 404;
    return (
      <div className="card text-center py-16 max-w-lg mx-auto mt-10">
        <IconBadge name={notFound ? 'search' : 'lock'} size="lg" className="mx-auto mb-3" />
        <p className="font-semibold text-gray-800">
          {notFound ? 'Không tìm thấy Workspace' : 'Bạn không có quyền truy cập Workspace này'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {notFound ? 'Workspace có thể đã bị xóa.' : 'Có thể bạn đã rời dự án hoặc chưa được thêm vào Workspace.'}
        </p>
        <Link to={backLink.to} className="btn-primary inline-block mt-5">← {backLink.label}</Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-50/50 border border-gray-200 rounded-xl overflow-hidden min-w-0 w-full relative">
      <div className="h-1 flex-shrink-0 bg-gradient-to-r from-primary-500 to-primary-700" />
      {/* Header */}
      <div className="bg-white border-b px-5 pt-3 flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="mr-2">
            <Link to={backLink.to} className="text-[11px] text-gray-400 hover:text-primary-700">← {backLink.label}</Link>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{workspace?.name}</h1>
            <p className="text-xs text-gray-500">{workspace?.Project?.name}</p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-2 flex-wrap">
            <div className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">
              <Icon name="clipboard" className="w-3.5 h-3.5 mr-1" />{stats.total} tasks
            </div>
            <div className="text-xs bg-primary-50 px-2.5 py-1 rounded-full text-primary-700">
              <Icon name="bolt" className="w-3.5 h-3.5 mr-1" />{stats.inProgress} đang làm
            </div>
            <div className="text-xs bg-green-50 px-2.5 py-1 rounded-full text-green-700">
              <Icon name="verified" className="w-3.5 h-3.5 mr-1" />{stats.done} hoàn thành
            </div>
            {stats.overdue > 0 && (
              <div className="text-xs bg-red-50 px-2.5 py-1 rounded-full text-red-600 font-semibold">
                <Icon name="alert" className="w-3.5 h-3.5 mr-1" />{stats.overdue} quá hạn
              </div>
            )}
          </div>

        </div>

        <div className="flex items-center gap-2 flex-wrap pb-3">
          {/* Section tabs */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setActiveSection('board')}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'board' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
              <Icon name="clipboard" className="w-3.5 h-3.5 mr-1" />Board
            </button>
            <button onClick={() => setActiveSection('stats')}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'stats' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
              <Icon name="chart" className="w-3.5 h-3.5 mr-1" />Thống kê
            </button>
            {canManage && (
              <>
                <button onClick={() => setActiveSection('members')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'members' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                  <Icon name="users" className="w-3.5 h-3.5 mr-1" />Thành viên
                </button>
                <button onClick={() => setActiveSection('logs')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${activeSection === 'logs' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                  <Icon name="history" className="w-3.5 h-3.5 mr-1" />Nhật ký
                </button>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Cách hiển thị (chỉ ở tab Board) */}
            {activeSection === 'board' && (
              <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                <button onClick={() => setViewMode('kanban')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'}`}>
                  <Icon name="board" className="w-3.5 h-3.5 mr-1" />Kanban
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'}`}>
                  <Icon name="list" className="w-3.5 h-3.5 mr-1" />Danh sách
                </button>
              </div>
            )}

            {canManage && activeSection === 'board' && (
              <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-1.5 px-3">
                <Icon name="plus" className="w-4 h-4" />Tạo Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Thanh lọc: chỉ có tác dụng ở tab Board nên các tab khác không hiện */}
      {activeSection === 'board' && (
        <div className="bg-white border-b px-5 py-2 flex items-center gap-3 text-sm flex-wrap">
          <span className="text-xs text-gray-400 font-semibold uppercase">Bộ lọc:</span>

          {/* Lọc nhanh task của mình */}
          {myMember && (
            <button
              onClick={() => setFilters(f => ({ ...f, assignee_id: f.assignee_id === myMember.id ? '' : myMember.id }))}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                filters.assignee_id === myMember.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
              }`}>
              <Icon name="user" className="w-3.5 h-3.5 mr-1" />Task của tôi{myOpenTaskCount ? ` (${myOpenTaskCount})` : ''}
            </button>
          )}
        
          <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
            value={filters.priority} onChange={e => setFilters(f => ({...f, priority: e.target.value}))}>
            <option value="">Tất cả ưu tiên</option>
            {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
            value={filters.label} onChange={e => setFilters(f => ({...f, label: e.target.value}))}>
            <option value="">Tất cả label</option>
            {ALL_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400"
            value={filters.assignee_id} onChange={e => setFilters(f => ({...f, assignee_id: e.target.value}))}>
            <option value="">Tất cả thành viên</option>
            <option value="__unassigned">Chưa giao</option>
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
      )}

      {/* Content */}
      {/* ─── Stats Section: chỉ giữ những số liệu dùng được ngay (số task theo trạng thái, việc cần chú ý, khối lượng từng người) ─── */}
      {activeSection === 'stats' && (
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!wsStats ? (
            <div className="flex items-center justify-center h-32"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-5 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Cần làm', value: wsStats.by_status?.TODO, color: 'bg-gray-50 text-gray-600', icon: 'clock' },
                  { label: 'Đang làm', value: wsStats.by_status?.IN_PROGRESS, color: 'bg-primary-50 text-primary-700', icon: 'bolt' },
                  { label: 'Chờ duyệt', value: wsStats.by_status?.REVIEW, color: 'bg-amber-50 text-amber-700', icon: 'inbox' },
                  { label: 'Hoàn thành', value: wsStats.by_status?.DONE, color: 'bg-green-50 text-green-700', icon: 'verified' },
                  { label: 'Quá hạn', value: wsStats.overdue, color: 'bg-red-50 text-red-600', icon: 'alert' },
                ].map((s, i) => (
                  <div key={i} className={`rounded-xl p-3 ${s.color} border border-white/50`}>
                    <p className="text-2xl font-black">{s.value ?? 0}</p>
                    <p className="text-xs font-medium mt-0.5 opacity-75"><Icon name={s.icon} className="w-3.5 h-3.5 mr-1" />{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Việc cần chú ý: quá hạn và sắp đến hạn */}
              <div className="bg-white rounded-2xl border p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3">Cần chú ý</h3>
                {wsStats.attention?.length ? (
                  <div className="divide-y divide-gray-100">
                    {wsStats.attention.map(t => {
                      const days = Math.ceil((new Date(new Date(t.deadline).setHours(23, 59, 59, 999)) - new Date()) / 86400000);
                      return (
                        <button key={t.id} onClick={() => setSelectedTaskId(t.id)}
                          className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-gray-50 rounded-lg px-2 transition-colors">
                          <Icon name={t.overdue ? 'alert' : 'clock'} className={`w-4 h-4 flex-shrink-0 ${t.overdue ? 'text-red-500' : 'text-amber-500'}`} />
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-gray-900 truncate">{t.title}</span>
                            <span className="block text-xs text-gray-400 truncate">{t.assignees?.length ? t.assignees.join(', ') : 'Chưa giao'}</span>
                          </span>
                          <span className={`text-xs font-semibold flex-shrink-0 ${t.overdue ? 'text-red-600' : 'text-amber-600'}`}>
                            {t.overdue ? `Quá hạn ${Math.max(1, -days + 1)} ngày` : days <= 0 ? 'Hết hạn hôm nay' : `Còn ${days} ngày`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-2">Không có task nào quá hạn hoặc sắp đến hạn trong 3 ngày tới.</p>
                )}
              </div>

              {/* Khối lượng việc của từng người (giúp Admin/Lead chia việc đều) */}
              <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                <h3 className="font-bold text-gray-800 px-4 pt-4 pb-2">Khối lượng công việc</h3>
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="text-left font-semibold px-4 py-2">Thành viên</th>
                      <th className="font-semibold px-2 py-2">Cần làm</th>
                      <th className="font-semibold px-2 py-2">Đang làm</th>
                      <th className="font-semibold px-2 py-2">Chờ duyệt</th>
                      <th className="font-semibold px-2 py-2">Hoàn thành</th>
                      <th className="font-semibold px-2 py-2">Quá hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {wsStats.members?.map(m => (
                      <tr key={m.id}>
                        <td className="px-4 py-2.5">
                          <span className="flex items-center gap-2">
                            <Avatar name={m.name} size="sm" />
                            <span className="font-medium text-gray-800">{m.name}</span>
                            {m.role === 'LEAD' && <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">Lead</span>}
                          </span>
                        </td>
                        <td className="text-center px-2 py-2.5 text-gray-600">{m.todo}</td>
                        <td className="text-center px-2 py-2.5 text-primary-700 font-semibold">{m.in_progress}</td>
                        <td className="text-center px-2 py-2.5 text-amber-700">{m.review}</td>
                        <td className="text-center px-2 py-2.5 text-green-700">{m.done}</td>
                        <td className={`text-center px-2 py-2.5 ${m.overdue ? 'text-red-600 font-bold' : 'text-gray-300'}`}>{m.overdue || '–'}</td>
                      </tr>
                    ))}
                    {/* Task chưa giao cho ai */}
                    <tr className="bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-500">Chưa giao</td>
                      <td className="text-center px-2 py-2.5 text-gray-600" colSpan={5}>
                        {allTasks.filter(t => !['DONE', 'CANCELLED'].includes(t.status) && !t.Assignees?.length).length} task chưa có người thực hiện
                      </td>
                    </tr>
                    {!wsStats.members?.length && (
                      <tr><td colSpan={6} className="text-center text-sm text-gray-400 py-6">Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
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
                <h3 className="font-bold text-gray-800">Quản lý thành viên ({members.length})</h3>
                {isAdmin() && (
                  <button onClick={() => setShowAddMember(v => !v)} className="btn-primary text-xs py-1.5 px-3">
                    {showAddMember ? 'Đóng' : '+ Thêm thành viên'}
                  </button>
                )}
              </div>

              {/* Thêm ứng viên trúng tuyển vào workspace (Admin) */}
              {isAdmin() && showAddMember && (
                <div className="px-5 py-4 border-b bg-primary-50/40">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ứng viên đã trúng tuyển chưa có trong Workspace</p>
                  {eligibleLoading ? (
                    <div className="flex justify-center py-4"><LoadingSpinner /></div>
                  ) : eligibleCandidates.length ? (
                    <div className="space-y-2">
                      {eligibleCandidates.map(c => (
                        <div key={c.candidate_profile_id} className="flex items-center gap-3 bg-white rounded-lg border px-3 py-2">
                          <Avatar name={c.full_name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{c.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">{c.email} · Vị trí: {c.job_title}</p>
                          </div>
                          <button
                            onClick={() => addMemberMut.mutate(c)}
                            disabled={addMemberMut.isPending}
                            className="text-xs text-primary-700 hover:text-primary-800 px-2 py-1 rounded hover:bg-primary-50 transition-colors disabled:opacity-50"
                          >
                            Thêm
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-3">Không có ứng viên trúng tuyển nào đang chờ thêm vào Workspace</p>
                  )}
                </div>
              )}

              {/* Giải thích vai trò trong Workspace */}
              <div className="px-5 py-3 border-b bg-white text-xs text-gray-600 space-y-1">
                <p><span className="font-semibold text-primary-700">Admin (chủ dự án)</span>: toàn quyền — thêm/xóa thành viên, cử Lead, tạo và giao việc, nghiệm thu, bình luận.</p>
                <p><span className="font-semibold text-primary-700">Lead</span>: do Admin cử — phân chia công việc như Jira: tạo task, giao việc cho thành viên, sửa task, nghiệm thu và bình luận.</p>
                <p><span className="font-semibold text-gray-700">Thành viên</span>: làm các task được giao, nộp sản phẩm và phản hồi bình luận trong task của mình (task người khác chỉ đọc).</p>
              </div>

              <div className="divide-y">
                {members.map(m => {
                  const name = m.CandidateProfile?.User?.full_name;
                  const email = m.CandidateProfile?.User?.email;
                  const isMe = m.CandidateProfile?.user_id === user?.id;
                  const canModify = canManageMembers && !isMe;
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{name} {isMe && <span className="text-xs text-primary-700">(bạn)</span>}</p>
                        <p className="text-xs text-gray-400 truncate">{email}</p>
                      </div>
                      {/* Khối lượng việc hiện tại → để Lead/Admin chia việc đều */}
                      <span className="text-[11px] text-gray-500 flex-shrink-0" title="Số task đang thực hiện (chưa nghiệm thu)">
                        <Icon name="clipboard" className="w-3.5 h-3.5 mr-1" />{workload[m.id] || 0} task
                      </span>
                      {/* Cử / gỡ Lead nhanh */}
                      {canModify && m.role === 'MEMBER' && (
                        <button onClick={() => updateRoleMut.mutate({ memberId: m.id, role: 'LEAD' })} disabled={updateRoleMut.isPending}
                          title="Cử làm Lead: được tạo task, giao việc và nghiệm thu"
                          className="text-xs text-primary-700 hover:text-primary-800 px-2 py-1 rounded hover:bg-primary-50 transition-colors disabled:opacity-50">
                          <Icon name="star" className="w-3.5 h-3.5 mr-1" />Cử làm Lead
                        </button>
                      )}
                      {canModify && m.role === 'LEAD' && (
                        <button onClick={async () => { if (await confirm({ title: 'Gỡ vai trò Lead', message: `Gỡ vai trò Lead của ${name}?`, confirmText: 'Gỡ Lead', tone: 'danger' })) updateRoleMut.mutate({ memberId: m.id, role: 'MEMBER' }); }} disabled={updateRoleMut.isPending}
                          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50">
                          Gỡ Lead
                        </button>
                      )}
                      {/* Role selector */}
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
                        value={m.role || 'MEMBER'}
                        onChange={e => updateRoleMut.mutate({ memberId: m.id, role: e.target.value })}
                        disabled={!canModify || updateRoleMut.isPending}
                      >
                        {ROLE_OPTIONS.map(k => <option key={k} value={k}>{MEMBER_ROLE_LABELS[k]}</option>)}
                      </select>
                      {/* Nút xóa thành viên (chỉ Admin) */}
                      {canModify && (
                        <button
                          onClick={async () => { if (await confirm({ title: 'Xóa thành viên', message: `Xóa ${name} khỏi workspace?`, confirmText: 'Xóa', tone: 'danger' })) removeMemberMut.mutate(m.id); }}
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
                    <IconBadge name="user" size="lg" className="mx-auto mb-2" />
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
          <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            {/* 4 cột chia đều chiều rộng; màn hình quá hẹp (< ~930px) thì cuộn ngang */}
            <div className="flex gap-4 h-full min-w-[928px]">
              {STATUS_COLUMNS.map(statusId => {
                // Khi đang kéo: cột không hợp lệ bị khóa và làm mờ
                const dropBlocked = !!draggingTask && !canDropTo(draggingTask, statusId);
                return (
                <Droppable key={statusId} droppableId={statusId} isDropDisabled={dropBlocked}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                      className={`flex flex-col rounded-2xl flex-1 min-w-[220px] min-h-[200px] transition-all
                        ${snapshot.isDraggingOver ? 'bg-primary-50 ring-2 ring-primary-300' : STATUS_META[statusId].color}
                        ${dropBlocked && draggingTask.status !== statusId ? 'opacity-40' : ''}`}>
                      
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
                            isDragDisabled={!canDragTask(task)}>
                            {(prov, snap) => (
                              <TaskCard task={task} provided={prov} snapshot={snap} isMine={isMine(task)}
                                onClick={() => setSelectedTaskId(task.id)} />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {!columns[statusId].length && !snapshot.isDraggingOver && statusId !== 'TODO' && (
                          <p className="text-xs text-gray-400 text-center py-6">Chưa có task</p>
                        )}

                        {/* Task mới chỉ được tạo ở cột "Cần làm" */}
                        {statusId === 'TODO' && canManage && (
                          <button onClick={() => setShowCreateModal(true)}
                            className="w-full text-left text-xs text-gray-400 hover:text-gray-600 px-2 py-2 rounded-lg hover:bg-white/60 transition-colors">
                            + Thêm task...
                          </button>
                        )}
                        {statusId === 'TODO' && !canManage && !columns[statusId].length && !snapshot.isDraggingOver && (
                          <p className="text-xs text-gray-400 text-center py-6">Chưa có task</p>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
                );
              })}
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
                  <IconBadge name="inbox" size="lg" className="mx-auto mb-3" />
                  <p className="font-medium">Không có task nào</p>
                  {canManage && <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-3 text-sm">Tạo task đầu tiên</button>}
                </div>
              ) : [...filteredTasks]
                // Sắp theo thứ tự cột Kanban (giữ nguyên thứ tự trong từng cột)
                .sort((a, b) => STATUS_COLUMNS.indexOf(a.status) - STATUS_COLUMNS.indexOf(b.status))
                .map(task => {
                const pm = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;
                const sm = STATUS_META[task.status] || STATUS_META.TODO;
                const isOverdue = isTaskOverdue(task);
                return (
                  <div key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="grid grid-cols-[1fr_120px_120px_150px_100px] gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer items-center">
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium ${task.status === 'DONE' ? 'text-gray-500' : 'text-gray-900'}`}>
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
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${pm.dot}`} />{pm.label}
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
          key={selectedTaskId} // mở task khác thì làm mới trạng thái (chế độ sửa, bảng duyệt...)
          taskId={selectedTaskId}
          members={members}
          workload={workload}
          canManage={canManage}
          workspaceId={id}
          workspaceName={workspace?.name}
          initialReview={reviewIntent}
          onClose={() => { setSelectedTaskId(null); setReviewIntent(null); }}
        />
      )}

      {/* Nộp sản phẩm khi kéo task sang "Chờ duyệt" */}
      {submitTarget && (
        <SubmitWorkModal
          task={submitTarget}
          workspaceId={id}
          onClose={() => setSubmitTarget(null)}
          onSubmitted={() => setSubmitTarget(null)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          workspaceId={id}
          members={members}
          workload={workload}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
