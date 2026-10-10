const {
  Task, TaskAssignee, SubTask, TaskComment, TaskActivity, TaskSubmission,
  Workspace, WorkspaceMember, CandidateProfile, User, Project
} = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const notifCtrl = require('./notificationController');
const { logActivity } = require('../utils/activityLogger');
const { getWorkspaceAccess } = require('../utils/workspaceAccess');

// ─── Quy tắc nghiệp vụ của bảng Kanban ──────────────────────────────────────
const STATUS_LABELS = { TODO: 'Cần làm', IN_PROGRESS: 'Đang làm', REVIEW: 'Chờ duyệt', DONE: 'Hoàn thành', CANCELLED: 'Đã hủy' };
const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
// Luồng trạng thái hợp lệ khi kéo thả / bấm nút.
// Ra khỏi "Chờ duyệt" (sang Hoàn thành hoặc quay lại Đang làm) chỉ qua nghiệm thu (reviewTask).
const TRANSITIONS = { TODO: ['IN_PROGRESS'], IN_PROGRESS: ['TODO', 'REVIEW'], REVIEW: [], DONE: [], CANCELLED: [] };
// Trạng thái còn được cập nhật tiến độ / subtask
const EDITABLE_STATUSES = ['TODO', 'IN_PROGRESS'];

// Helper: quyền xem workspace (thành viên ACTIVE, Quản lý dự án, Admin)
async function requireView(req, workspaceId) {
  const access = await getWorkspaceAccess(req, workspaceId);
  if (!access.canView) throw new AppError('Bạn không phải thành viên của Workspace này', 403);
  return access;
}

// Helper: quyền quản lý task (Admin, Quản lý dự án, MANAGER, LEAD)
async function requireManageTasks(req, workspaceId) {
  const access = await getWorkspaceAccess(req, workspaceId);
  if (!access.canManageTasks) throw new AppError('Chỉ Quản lý hoặc Lead mới có quyền thực hiện thao tác này', 403);
  return access;
}

// Helper: user hiện tại có được giao task này không
async function isAssignee(taskId, member) {
  if (!member) return false;
  return !!(await TaskAssignee.findOne({ where: { task_id: taskId, workspace_member_id: member.id } }));
}

// Helper: danh sách workspace_member_id đang được giao task
async function getAssigneeIds(taskId) {
  const rows = await TaskAssignee.findAll({ where: { task_id: taskId }, attributes: ['workspace_member_id'] });
  return rows.map(r => r.workspace_member_id);
}

// Helper: người được giao phải là thành viên ACTIVE của workspace và không phải vai trò "Xem" (UC: phân công thất bại)
async function validateAssignees(workspaceId, assigneeIds) {
  if (!Array.isArray(assigneeIds)) throw new AppError('Danh sách người được giao không hợp lệ', 400);
  const ids = [...new Set(assigneeIds)];
  if (!ids.length) return ids;
  const members = await WorkspaceMember.findAll({
    where: { id: { [Op.in]: ids }, workspace_id: workspaceId, status: 'ACTIVE' },
    attributes: ['id', 'role']
  });
  if (members.length !== ids.length) throw new AppError('Không thể phân công: có người được giao không thuộc Workspace này', 400);
  if (members.some(m => m.role === 'VIEWER')) throw new AppError('Không thể giao task cho thành viên có vai trò "Xem"', 400);
  return ids;
}

// Helper: deadline không được ở quá khứ (UC: deadline không hợp lệ)
function validateDeadline(deadline) {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (isNaN(date.getTime())) throw new AppError('Deadline không hợp lệ', 400);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) throw new AppError('Deadline không được nhỏ hơn ngày hiện tại', 400);
  return date;
}

// Helper: chuẩn hóa tiêu đề task / subtask
function cleanTitle(title, label = 'Tiêu đề task') {
  const t = typeof title === 'string' ? title.trim() : '';
  if (!t) throw new AppError(`${label} không được để trống`, 400);
  if (t.length > 255) throw new AppError(`${label} tối đa 255 ký tự`, 400);
  return t;
}

function validatePriority(priority) {
  if (!PRIORITIES.includes(priority)) throw new AppError('Độ ưu tiên không hợp lệ', 400);
  return priority;
}

function validateLabels(labels) {
  if (!Array.isArray(labels) || labels.some(l => typeof l !== 'string' || !l.trim())) {
    throw new AppError('Danh sách label không hợp lệ', 400);
  }
  return [...new Set(labels.map(l => l.trim()))];
}

// Helper: % hoàn thành phải từ 0 đến 100
function validateRate(rate) {
  const n = Number(rate);
  if (!Number.isInteger(n) || n < 0 || n > 100) throw new AppError('Phần trăm hoàn thành phải từ 0 đến 100', 400);
  return n;
}

// Helper: kiểm tra chuyển trạng thái có đúng luồng Kanban không
function assertTransition(from, to) {
  if (!STATUS_LABELS[to]) throw new AppError('Trạng thái không hợp lệ', 400);
  if (TRANSITIONS[from]?.includes(to)) return;
  if (from === 'DONE') throw new AppError('Task đã được nghiệm thu, không thể chuyển trạng thái', 400);
  if (from === 'REVIEW') throw new AppError('Task đang chờ duyệt. Quản lý hãy mở task và chọn "Duyệt" hoặc "Yêu cầu sửa"', 400);
  if (to === 'DONE') throw new AppError('Task chỉ được hoàn thành khi Quản lý duyệt (nghiệm thu) ở cột "Chờ duyệt"', 400);
  if (from === 'TODO' && to === 'REVIEW') throw new AppError('Hãy chuyển task sang "Đang làm" trước khi gửi duyệt', 400);
  throw new AppError(`Không thể chuyển task từ "${STATUS_LABELS[from]}" sang "${STATUS_LABELS[to]}"`, 400);
}

// Helper: muốn gửi duyệt thì mọi subtask phải hoàn thành
async function requireSubtasksDone(taskId) {
  const pending = await SubTask.count({ where: { task_id: taskId, is_done: false } });
  if (pending) throw new AppError(`Còn ${pending} subtask chưa hoàn thành. Hãy hoàn thành hết trước khi gửi duyệt`, 400);
}

// Helper: link sản phẩm (GitHub, Drive, Figma...) phải là URL http/https
function cleanProductUrl(url) {
  const u = typeof url === 'string' ? url.trim() : '';
  if (!u) return null;
  if (u.length > 500) throw new AppError('Link sản phẩm tối đa 500 ký tự', 400);
  let parsed;
  try { parsed = new URL(u); } catch { parsed = null; }
  if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) {
    throw new AppError('Link sản phẩm không hợp lệ (cần bắt đầu bằng http:// hoặc https://)', 400);
  }
  return u;
}

// Helper: file đính kèm phải là file đã tải lên qua /api/upload/task-file và còn tồn tại
function cleanAttachmentUrl(url) {
  if (!url) return null;
  if (typeof url !== 'string' || url.length > 500 || !/^\/uploads\/tasks\/[A-Za-z0-9_.-]+(\?name=\S*)?$/.test(url)) {
    throw new AppError('File đính kèm không hợp lệ', 400);
  }
  const filePath = path.join(__dirname, '../../uploads/tasks', path.basename(url.split('?')[0]));
  if (!fs.existsSync(filePath)) throw new AppError('File đính kèm không còn trên máy chủ, hãy tải lên lại', 400);
  return url;
}

// Helper: gắn tên người nộp cho từng lần nộp (lấy từ lịch sử "SUBMITTED" của task)
async function withSubmitters(task) {
  const json = task.toJSON();
  if (!json.TaskSubmissions?.length) return json;
  const acts = await TaskActivity.findAll({
    where: { task_id: task.id, action: 'SUBMITTED' },
    attributes: ['new_value', 'workspace_member_id'],
    include: [{
      model: WorkspaceMember, as: 'Actor', attributes: ['id'],
      include: [{ model: CandidateProfile, attributes: ['id'], include: [{ model: User, attributes: ['full_name'] }] }]
    }]
  });
  const byVersion = new Map(acts.map(a => [
    String(a.new_value),
    a.Actor?.CandidateProfile?.User?.full_name || (a.workspace_member_id ? null : 'Quản trị viên')
  ]));
  json.TaskSubmissions = json.TaskSubmissions.map(s => ({ ...s, submitted_by: byVersion.get(String(s.version)) || null }));
  return json;
}

// Helper: sắp xếp lại cột `status`, đặt task vào vị trí `index` (null = cuối cột)
async function placeInColumn(task, status, index = null) {
  const others = await Task.findAll({
    where: { workspace_id: task.workspace_id, status, id: { [Op.ne]: task.id } },
    order: [['position', 'ASC'], ['created_at', 'ASC']],
    attributes: ['id', 'position'],
  });
  const at = index === null ? others.length : Math.min(Math.max(index, 0), others.length);
  const ordered = [...others.slice(0, at), task, ...others.slice(at)];
  await Promise.all(ordered.map((t, i) => (
    t.position === i ? null : Task.update({ position: i }, { where: { id: t.id } })
  )));
}

// Helper: workspace_member_id → user_id (để gửi thông báo)
async function getMemberUserIds(memberIds) {
  if (!memberIds.length) return [];
  const members = await WorkspaceMember.findAll({
    where: { id: { [Op.in]: memberIds } },
    attributes: ['id'],
    include: [{ model: CandidateProfile, attributes: ['id', 'user_id'] }]
  });
  return members.map(m => m.CandidateProfile?.user_id).filter(Boolean);
}

// Helper: user_id của những người có quyền nghiệm thu (Quản lý dự án, MANAGER, LEAD)
async function getReviewerUserIds(workspaceId) {
  const workspace = await Workspace.findByPk(workspaceId, { include: [{ model: Project, attributes: ['manager_id'] }] });
  const reviewers = await WorkspaceMember.findAll({
    where: { workspace_id: workspaceId, status: 'ACTIVE', role: { [Op.in]: ['MANAGER', 'LEAD'] } },
    attributes: ['candidate_profile_id']
  });
  const profileIds = new Set(reviewers.map(m => m.candidate_profile_id));
  if (workspace?.Project?.manager_id) profileIds.add(workspace.Project.manager_id);
  if (!profileIds.size) return [];
  const profiles = await CandidateProfile.findAll({ where: { id: { [Op.in]: [...profileIds] } }, attributes: ['user_id'] });
  return profiles.map(p => p.user_id);
}

// Helper: link mở thẳng task trong Workspace (trang Workspace tự mở chi tiết task từ ?task=)
const taskLink = (task) => `/candidate/workspaces/${task.workspace_id}?task=${task.id}`;

// Helper: gửi thông báo (bỏ qua chính người thao tác)
async function notifyUsers(userIds, req, { type, title, message, task }) {
  const ids = [...new Set(userIds)].filter(uid => uid && uid !== req.user.id);
  await Promise.all(ids.map(uid => notifCtrl.createNotification({
    user_id: uid,
    type,
    title,
    message,
    link: taskLink(task), // mở thẳng task trong Workspace
    metadata: { task_id: task.id, workspace_id: task.workspace_id }
  })));
}

// Helper: ghi lịch sử của từng task (tab "Lịch sử")
async function logInternalTaskActivity(taskId, memberId, action, description, oldVal = null, newVal = null) {
  await TaskActivity.create({
    task_id: taskId,
    workspace_member_id: memberId || null,
    action,
    old_value: oldVal ? String(oldVal) : null,
    new_value: newVal ? String(newVal) : null,
    description: description?.substring(0, 500),
  }).catch(() => {}); // non-blocking
}

// Helper: full task include
const TASK_INCLUDE = [
  {
    model: WorkspaceMember,
    as: 'Assignees',
    through: { attributes: [] },
    include: [{
      model: CandidateProfile,
      include: [{ model: User, attributes: ['full_name', 'email'] }],
      attributes: ['id', 'professional_title', 'avatar_url']
    }],
    attributes: ['id', 'role']
  },
  {
    model: SubTask,
    as: 'SubTasks',
    separate: true,
    order: [['position', 'ASC'], ['created_at', 'ASC']],
    attributes: ['id', 'title', 'is_done', 'position']
  },
  {
    model: TaskComment,
    as: 'Comments',
    separate: true,
    include: [{
      model: WorkspaceMember,
      as: 'Author',
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['full_name'] }], attributes: ['avatar_url'] }],
      attributes: ['id']
    }],
    order: [['created_at', 'ASC']],
    attributes: ['id', 'content', 'created_at', 'workspace_member_id']
  },
  {
    model: TaskActivity,
    as: 'Activities',
    separate: true,
    include: [{
      model: WorkspaceMember,
      as: 'Actor',
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['full_name'] }], attributes: ['avatar_url'] }],
      attributes: ['id']
    }],
    order: [['created_at', 'DESC']],
    limit: 50,
    attributes: ['id', 'action', 'old_value', 'new_value', 'description', 'created_at']
  },
  {
    model: TaskSubmission,
    separate: true,
    order: [['version', 'DESC']],
    attributes: ['id', 'product_url', 'attachment_url', 'note', 'version', 'review_status', 'submitted_at']
  }
];

// ─── GET /api/tasks/workspace/:workspaceId ─────────────────────────────────
exports.getWorkspaceTasks = async (req, res, next) => {
  try {
    await requireView(req, req.params.workspaceId);

    const { status, priority, assignee_id, label } = req.query;
    const where = { workspace_id: req.params.workspaceId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (label) where.labels = { [Op.contains]: [label] };

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: WorkspaceMember,
          as: 'Assignees',
          through: { attributes: [] },
          include: [{
            model: CandidateProfile,
            include: [{ model: User, attributes: ['full_name'] }],
            attributes: ['id', 'avatar_url']
          }],
          attributes: ['id']
        },
        {
          model: SubTask,
          as: 'SubTasks',
          attributes: ['id', 'is_done']
        }
      ],
      order: [['position', 'ASC'], ['created_at', 'ASC']],
    });

    // Filter by assignee if specified
    let result = tasks;
    if (assignee_id) {
      result = tasks.filter(t => t.Assignees.some(a => a.id === assignee_id));
    }

    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

// ─── GET /api/tasks/:id ────────────────────────────────────────────────────
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, { include: TASK_INCLUDE });
    if (!task) throw new AppError('Task not found', 404);
    await requireView(req, task.workspace_id);
    res.json({ success: true, data: await withSubmitters(task) });
  } catch (error) { next(error); }
};

// ─── POST /api/tasks/workspace/:workspaceId ────────────────────────────────
// Task mới luôn nằm ở cột "Cần làm" rồi mới chuyển trạng thái dần
exports.createTask = async (req, res, next) => {
  try {
    const { description, deadline, sub_tasks } = req.body;
    const workspaceId = req.params.workspaceId;

    const access = await requireManageTasks(req, workspaceId);
    const title = cleanTitle(req.body.title);
    const priority = validatePriority(req.body.priority || 'MEDIUM');
    const labels = req.body.labels === undefined ? [] : validateLabels(req.body.labels);
    const validDeadline = validateDeadline(deadline);
    const assignee_ids = await validateAssignees(workspaceId, req.body.assignee_ids || []);
    const subTitles = Array.isArray(sub_tasks)
      ? sub_tasks.filter(st => typeof st === 'string' && st.trim()).map(st => cleanTitle(st, 'Tên subtask'))
      : [];

    // Đặt task ở cuối cột "Cần làm"
    const maxPos = await Task.max('position', { where: { workspace_id: workspaceId, status: 'TODO' } });

    const task = await Task.create({
      workspace_id: workspaceId,
      title,
      description: description || null,
      priority,
      deadline: validDeadline,
      labels,
      status: 'TODO',
      position: (maxPos ?? -1) + 1,
    });

    // Assign members
    if (assignee_ids.length) {
      await TaskAssignee.bulkCreate(
        assignee_ids.map(wm_id => ({ task_id: task.id, workspace_member_id: wm_id })),
        { ignoreDuplicates: true }
      );
    }

    // Create sub-tasks
    if (subTitles.length) {
      await SubTask.bulkCreate(subTitles.map((st, i) => ({ task_id: task.id, title: st, position: i })));
    }

    await logInternalTaskActivity(task.id, access.member?.id, 'TASK_CREATED', `Tạo task "${title}"`);

    // Thông báo cho người được giao
    await notifyUsers(await getMemberUserIds(assignee_ids), req, {
      type: 'TASK_ASSIGNED',
      title: '📌 Bạn được giao task mới',
      message: `Task: "${title}" đã được giao cho bạn`,
      task,
    });

    await logActivity(req, {
      action: 'TASK_CREATED',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: title,
      description: `Tạo task "${title}" trong workspace`,
      metadata: { workspace_id: workspaceId },
    });

    const fullTask = await Task.findByPk(task.id, { include: TASK_INCLUDE });
    res.status(201).json({ success: true, data: fullTask });
  } catch (error) { next(error); }
};

// ─── PUT /api/tasks/:id ─────────────────────────────────────────────────────
// - Người quản lý task: sửa thông tin, giao việc, đổi trạng thái, sắp xếp thứ tự
// - Người được giao: đổi trạng thái theo luồng, cập nhật tiến độ
// - Thành viên khác: chỉ được tự nhận task chưa có ai làm
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    const access = await requireView(req, task.workspace_id);
    const { member, canManageTasks } = access;
    const { title, description, priority, deadline, actual_hours, labels, status, completion_rate, assignee_ids, position } = req.body;

    if (task.status === 'DONE') throw new AppError('Task đã được nghiệm thu, không thể chỉnh sửa', 400);

    const currentIds = await getAssigneeIds(task.id);
    const isAssignedNow = !!member && currentIds.includes(member.id);
    const statusChanged = status !== undefined && status !== task.status;
    const updateData = {};
    const changes = []; // { action, desc, old, new, taskActivity } — ghi nhật ký sau khi lưu

    // ── 1. Kiểm tra toàn bộ dữ liệu trước khi ghi ─────────────────────────────

    // Thông tin task: chỉ người quản lý task
    const editsInfo = [title, description, priority, deadline, labels].some(v => v !== undefined);
    if (editsInfo) {
      if (!canManageTasks) throw new AppError('Bạn chỉ được cập nhật tiến độ, không được sửa thông tin task', 403);
      if (title !== undefined) {
        const t = cleanTitle(title);
        if (t !== task.title) {
          updateData.title = t;
          changes.push({ action: 'TASK_UPDATED', activity: 'UPDATED', old: task.title, new: t, desc: `Đổi tiêu đề thành "${t}"` });
        }
      }
      if (description !== undefined) updateData.description = description || null;
      if (priority !== undefined && priority !== task.priority) {
        updateData.priority = validatePriority(priority);
        changes.push({ action: 'TASK_UPDATED', activity: 'UPDATED', old: task.priority, new: priority, desc: `Đổi độ ưu tiên: ${task.priority} → ${priority}` });
      }
      if (deadline !== undefined) {
        // Chỉ kiểm tra khi deadline thực sự thay đổi (giữ nguyên deadline cũ đã quá hạn vẫn được)
        const oldDay = task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : null;
        const newDay = deadline ? String(deadline).slice(0, 10) : null;
        if (newDay !== oldDay) {
          updateData.deadline = validateDeadline(deadline);
          changes.push({ action: 'TASK_UPDATED', activity: 'UPDATED', old: oldDay, new: newDay, desc: newDay ? `Đổi deadline thành ${newDay}` : 'Bỏ deadline' });
        }
      }
      if (labels !== undefined) updateData.labels = validateLabels(labels);
    }

    // Người thực hiện
    let newAssigneeIds = null; // null = không đổi
    if (assignee_ids !== undefined) {
      if (canManageTasks) {
        newAssigneeIds = await validateAssignees(task.workspace_id, assignee_ids);
      } else {
        // Thành viên chỉ được tự nhận task chưa có ai làm
        const isSelfClaim = !!member && currentIds.length === 0 && Array.isArray(assignee_ids) &&
          assignee_ids.length === 1 && assignee_ids[0] === member.id;
        if (!isSelfClaim) throw new AppError('Bạn không có quyền thay đổi người thực hiện của task này', 403);
        if (member.role === 'VIEWER') throw new AppError('Thành viên có vai trò "Xem" không thể nhận task', 403);
        newAssigneeIds = [member.id];
      }
    }
    const finalAssigneeIds = newAssigneeIds ?? currentIds;
    const finalStatus = statusChanged ? status : task.status;
    if (finalStatus !== 'TODO' && finalAssigneeIds.length === 0) {
      throw new AppError(statusChanged
        ? 'Task chưa được giao cho ai. Hãy phân công người thực hiện trước khi chuyển trạng thái'
        : 'Task đang thực hiện phải có ít nhất một người thực hiện', 400);
    }

    // Trạng thái: người quản lý task hoặc người được giao, đúng luồng Kanban
    if (statusChanged) {
      if (!canManageTasks && !isAssignedNow) throw new AppError('Bạn không được phân công task này', 403);
      assertTransition(task.status, status);
      // Gửi duyệt phải kèm sản phẩm → đi qua API nộp sản phẩm (POST /tasks/:id/submissions)
      if (status === 'REVIEW') throw new AppError('Hãy dùng "Nộp sản phẩm & gửi duyệt" để đính kèm link hoặc file sản phẩm', 400);
      updateData.status = status;
      changes.push({
        action: 'TASK_STATUS_CHANGED', activity: 'STATUS_CHANGED', old: task.status, new: status,
        desc: `Chuyển trạng thái: ${STATUS_LABELS[task.status]} → ${STATUS_LABELS[status]}`
      });
    }

    // Tiến độ thủ công (% / giờ thực tế): chỉ khi task đang làm
    if (completion_rate !== undefined || actual_hours !== undefined) {
      if (!canManageTasks && !isAssignedNow) throw new AppError('Bạn không được phân công task này', 403);
      if (finalStatus !== 'IN_PROGRESS') {
        throw new AppError(finalStatus === 'TODO'
          ? 'Hãy bắt đầu làm task trước khi cập nhật tiến độ'
          : 'Task đang chờ duyệt, không thể cập nhật tiến độ', 400);
      }
      if (completion_rate !== undefined) {
        const subCount = await SubTask.count({ where: { task_id: task.id } });
        if (subCount) throw new AppError('Task có subtask nên % hoàn thành được tính tự động theo subtask', 400);
        const rate = validateRate(completion_rate);
        if (rate !== task.completion_rate) {
          updateData.completion_rate = rate;
          changes.push({
            action: 'TASK_UPDATED', activity: 'PROGRESS', old: `${task.completion_rate}%`, new: `${rate}%`,
            desc: `Cập nhật tiến độ: ${task.completion_rate}% → ${rate}%`
          });
        }
      }
      if (actual_hours !== undefined) updateData.actual_hours = actual_hours;
    }

    // Vị trí trong cột (kéo thả). Sắp xếp trong cùng cột chỉ dành cho người quản lý task
    let targetIndex = null;
    if (position !== undefined) {
      targetIndex = Number(position);
      if (!Number.isInteger(targetIndex) || targetIndex < 0) throw new AppError('Vị trí không hợp lệ', 400);
      if (!statusChanged && !canManageTasks) throw new AppError('Chỉ Quản lý hoặc Lead mới được sắp xếp thứ tự task', 403);
    }

    // ── 2. Ghi dữ liệu ────────────────────────────────────────────────────────
    let addedIds = [];
    if (newAssigneeIds) {
      addedIds = newAssigneeIds.filter(id => !currentIds.includes(id));
      const removedIds = currentIds.filter(id => !newAssigneeIds.includes(id));
      if (removedIds.length) await TaskAssignee.destroy({ where: { task_id: task.id, workspace_member_id: { [Op.in]: removedIds } } });
      if (addedIds.length) await TaskAssignee.bulkCreate(addedIds.map(wm_id => ({ task_id: task.id, workspace_member_id: wm_id })));
      if (addedIds.length || removedIds.length) {
        changes.push({
          action: 'TASK_UPDATED', activity: 'ASSIGNED',
          desc: canManageTasks ? 'Cập nhật người thực hiện' : 'Nhận task'
        });
      }
    }

    if (Object.keys(updateData).length) await task.update(updateData);
    if (statusChanged || targetIndex !== null) await placeInColumn(task, finalStatus, targetIndex);

    // ── 3. Nhật ký + thông báo ───────────────────────────────────────────────
    for (const change of changes) {
      await logInternalTaskActivity(task.id, member?.id, change.activity, change.desc, change.old, change.new);
      await logActivity(req, {
        action: change.action,
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        old_value: change.old,
        new_value: change.new,
        description: `${change.desc} (task "${task.title}")`,
        metadata: { workspace_id: task.workspace_id },
      });
    }

    // Người mới được giao (do Quản lý giao) nhận thông báo
    if (addedIds.length && canManageTasks) {
      await notifyUsers(await getMemberUserIds(addedIds), req, {
        type: 'TASK_ASSIGNED',
        title: '📌 Bạn được giao task mới',
        message: `Task: "${task.title}" đã được giao cho bạn`,
        task,
      });
    }

    const updatedTask = await Task.findByPk(task.id, { include: TASK_INCLUDE });
    res.json({ success: true, data: updatedTask });
  } catch (error) { next(error); }
};

// ─── DELETE /api/tasks/:id ──────────────────────────────────────────────────
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    await requireManageTasks(req, task.workspace_id);
    if (task.status === 'DONE') throw new AppError('Task đã được nghiệm thu, không thể xóa', 400);
    const { title, workspace_id } = task;
    await task.destroy();
    await logActivity(req, {
      action: 'TASK_DELETED',
      entity_type: 'task',
      entity_id: req.params.id,
      entity_name: title,
      description: `Đã xóa task "${title}"`,
      metadata: { workspace_id },
    });
    res.json({ success: true, message: 'Đã xóa task' });
  } catch (error) { next(error); }
};

// ─── PUT /api/tasks/:id/review ─────────────────────────────────────────────
// Nghiệm thu task đang "Chờ duyệt" → Duyệt (Hoàn thành) hoặc Yêu cầu sửa (về Đang làm)
exports.reviewTask = async (req, res, next) => {
  try {
    const { action } = req.body; // action: 'APPROVE' | 'REVISION'
    const review_note = typeof req.body.review_note === 'string' ? req.body.review_note.trim() : '';
    const task = await Task.findByPk(req.params.id || req.params.taskId);
    if (!task) throw new AppError('Task not found', 404);
    if (task.status !== 'REVIEW') throw new AppError('Task chưa ở trạng thái chờ duyệt', 400);

    const access = await getWorkspaceAccess(req, task.workspace_id);
    if (!access.canManageTasks) throw new AppError('Chỉ Manager hoặc Lead mới có quyền duyệt task', 403);
    const member = access.member;

    if (!['APPROVE', 'REVISION'].includes(action)) throw new AppError('Action phải là APPROVE hoặc REVISION', 400);
    if (action === 'REVISION' && !review_note) throw new AppError('Hãy nhập nội dung cần chỉnh sửa', 400);
    // Người thực hiện không được tự nghiệm thu task của mình (trừ Admin)
    if (!access.isAdmin && await isAssignee(task.id, member)) {
      throw new AppError('Bạn là người thực hiện task này nên không thể tự nghiệm thu', 403);
    }

    const approve = action === 'APPROVE';
    const newStatus = approve ? 'DONE' : 'IN_PROGRESS';
    await task.update({
      status: newStatus,
      review_status: approve ? 'APPROVED' : 'REVISION_REQUIRED',
      review_note: review_note || null,
      reviewed_by: member?.id || null,
      reviewed_at: new Date(),
      ...(approve && { completion_rate: 100 }),
    });
    await placeInColumn(task, newStatus);

    // Ghi kết quả nghiệm thu vào lần nộp sản phẩm gần nhất
    const latestSubmission = await TaskSubmission.findOne({ where: { task_id: task.id }, order: [['version', 'DESC']] });
    if (latestSubmission?.review_status === 'PENDING_REVIEW') {
      await latestSubmission.update({ review_status: approve ? 'ACCEPTED' : 'REVISION_REQUIRED' });
    }

    await logInternalTaskActivity(
      task.id, member?.id, approve ? 'TASK_APPROVED' : 'TASK_REVISION',
      approve
        ? `Nghiệm thu: duyệt hoàn thành${review_note ? ` — "${review_note}"` : ''}`
        : `Yêu cầu chỉnh sửa: "${review_note}"`
    );

    const notifyIds = await getMemberUserIds(await getAssigneeIds(task.id));
    await logActivity(req, {
      action: approve ? 'TASK_APPROVED' : 'TASK_REVISION_REQUESTED',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: task.title,
      description: approve
        ? `Task "${task.title}" đã được duyệt ✅${review_note ? `: ${review_note}` : ''}`
        : `Yêu cầu chỉnh sửa task "${task.title}": ${review_note}`,
      metadata: { workspace_id: task.workspace_id },
      notify_user_ids: notifyIds,
      notify_link: taskLink(task),
    });

    const updatedTask = await Task.findByPk(task.id, { include: TASK_INCLUDE });
    res.json({ success: true, data: updatedTask });
  } catch (error) { next(error); }
};

// ─── Sub-tasks ──────────────────────────────────────────────────────────────
const updateTaskProgress = async (taskId) => {
  const task = await Task.findByPk(taskId);
  if (!task) return;
  const subs = await SubTask.findAll({ where: { task_id: taskId } });
  if (subs.length > 0) {
    const done = subs.filter(s => s.is_done).length;
    const rate = Math.round((done / subs.length) * 100);
    await task.update({ completion_rate: rate });
  }
};

// Helper: quyền sửa subtask (người quản lý task hoặc người được giao, khi task chưa gửi duyệt)
async function requireEditSubTasks(req, task) {
  const access = await requireView(req, task.workspace_id);
  if (!EDITABLE_STATUSES.includes(task.status)) {
    throw new AppError(task.status === 'DONE'
      ? 'Task đã được nghiệm thu, không thể cập nhật subtask'
      : 'Task đang chờ duyệt, không thể cập nhật subtask', 400);
  }
  if (!access.canManageTasks && !(await isAssignee(task.id, access.member))) {
    throw new AppError('Bạn không được phân công task này', 403);
  }
  return access;
}

// Helper: lấy subtask thuộc đúng task trên URL
async function findSubTask(req) {
  const task = await Task.findByPk(req.params.id);
  if (!task) throw new AppError('Task not found', 404);
  const sub = await SubTask.findOne({ where: { id: req.params.subId, task_id: task.id } });
  if (!sub) throw new AppError('SubTask not found', 404);
  return { task, sub };
}

exports.addSubTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    await requireEditSubTasks(req, task);
    const title = cleanTitle(req.body.title, 'Tên subtask');
    const maxPos = await SubTask.max('position', { where: { task_id: task.id } });
    const sub = await SubTask.create({ task_id: task.id, title, position: (maxPos ?? -1) + 1 });
    await updateTaskProgress(task.id);
    res.status(201).json({ success: true, data: sub });
  } catch (error) { next(error); }
};

exports.updateSubTask = async (req, res, next) => {
  try {
    const { task, sub } = await findSubTask(req);
    await requireEditSubTasks(req, task);
    // Chỉ cho sửa các trường của subtask (không cho đổi task_id...)
    const { title, is_done, position } = req.body;
    await sub.update({
      ...(title !== undefined && { title: cleanTitle(title, 'Tên subtask') }),
      ...(is_done !== undefined && { is_done: !!is_done }),
      ...(position !== undefined && { position }),
    });
    await updateTaskProgress(sub.task_id);
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
};

exports.deleteSubTask = async (req, res, next) => {
  try {
    const { task, sub } = await findSubTask(req);
    await requireEditSubTasks(req, task);
    const taskId = sub.task_id;
    await sub.destroy();
    await updateTaskProgress(taskId);
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error) { next(error); }
};

// ─── Comments ───────────────────────────────────────────────────────────────
exports.addComment = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    const { member } = await requireView(req, task.workspace_id);
    // Bình luận gắn với thành viên workspace (Admin không phải thành viên)
    if (!member) throw new AppError('Chỉ thành viên Workspace mới có thể bình luận', 403);
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (!content) throw new AppError('Nội dung bình luận không được để trống', 400);

    const comment = await TaskComment.create({
      task_id: task.id,
      workspace_member_id: member.id,
      content,
    });

    await logActivity(req, {
      action: 'TASK_COMMENTED',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: task.title,
      description: `Bình luận mới trong task "${task.title}": "${content.substring(0, 100)}"`,
      metadata: { workspace_id: task.workspace_id },
    });

    const fullComment = await TaskComment.findByPk(comment.id, {
      include: [{
        model: WorkspaceMember,
        as: 'Author',
        include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['full_name'] }], attributes: ['avatar_url'] }],
        attributes: ['id']
      }]
    });

    res.status(201).json({ success: true, data: fullComment });
  } catch (error) { next(error); }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    const comment = await TaskComment.findOne({ where: { id: req.params.commentId, task_id: task.id } });
    if (!comment) throw new AppError('Comment not found', 404);

    // Chỉ người viết hoặc người quản lý task mới được xóa bình luận
    const access = await requireView(req, task.workspace_id);
    const isAuthor = access.member && comment.workspace_member_id === access.member.id;
    if (!isAuthor && !access.canManageTasks) throw new AppError('Bạn chỉ được xóa bình luận của mình', 403);

    await comment.destroy();
    res.json({ success: true, message: 'Đã xóa bình luận' });
  } catch (error) { next(error); }
};

// ─── Nộp sản phẩm ───────────────────────────────────────────────────────────
// POST /api/tasks/:id/submissions — nộp link/file sản phẩm và gửi duyệt (Đang làm → Chờ duyệt)
exports.submitTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    const access = await requireView(req, task.workspace_id);
    if (!access.canManageTasks && !(await isAssignee(task.id, access.member))) {
      throw new AppError('Bạn không được phân công task này', 403);
    }
    assertTransition(task.status, 'REVIEW');
    if (!(await TaskAssignee.count({ where: { task_id: task.id } }))) {
      throw new AppError('Task chưa được giao cho ai. Hãy phân công người thực hiện trước khi gửi duyệt', 400);
    }
    await requireSubtasksDone(task.id);

    const product_url = cleanProductUrl(req.body.product_url);
    const attachment_url = cleanAttachmentUrl(req.body.attachment_url);
    const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';
    if (!product_url && !attachment_url) {
      throw new AppError('Hãy đính kèm link hoặc file sản phẩm để Quản lý nghiệm thu', 400);
    }
    if (note.length > 2000) throw new AppError('Ghi chú tối đa 2000 ký tự', 400);

    const maxVersion = await TaskSubmission.max('version', { where: { task_id: task.id } });
    const version = (maxVersion ?? 0) + 1;
    const submission = await TaskSubmission.create({
      task_id: task.id,
      product_url,
      attachment_url,
      note: note || null,
      version,
      review_status: 'PENDING_REVIEW',
      submitted_at: new Date(),
    });

    // Task không có subtask: nộp sản phẩm nghĩa là đã làm xong → 100%
    const subCount = await SubTask.count({ where: { task_id: task.id } });
    await task.update({ status: 'REVIEW', review_status: 'PENDING', ...(!subCount && { completion_rate: 100 }) });
    await placeInColumn(task, 'REVIEW');

    await logInternalTaskActivity(task.id, access.member?.id, 'SUBMITTED', `Nộp sản phẩm lần ${version} và gửi duyệt`, null, version);
    await logActivity(req, {
      action: 'TASK_STATUS_CHANGED',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: task.title,
      old_value: 'IN_PROGRESS',
      new_value: 'REVIEW',
      description: `Nộp sản phẩm lần ${version}, chuyển trạng thái: Đang làm → Chờ duyệt (task "${task.title}")`,
      metadata: { workspace_id: task.workspace_id },
    });

    // Báo cho những người có quyền nghiệm thu
    await notifyUsers(await getReviewerUserIds(task.workspace_id), req, {
      type: 'TASK_STATUS_CHANGED',
      title: '⏳ Task chờ duyệt',
      message: `Task "${task.title}" đã được nộp sản phẩm (lần ${version}) và đang chờ duyệt`,
      task,
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) { next(error); }
};

// GET /api/tasks/:id/submissions — lịch sử các lần nộp sản phẩm
exports.getTaskSubmissions = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: TaskSubmission, separate: true, order: [['version', 'DESC']] }]
    });
    if (!task) throw new AppError('Task not found', 404);
    await requireView(req, task.workspace_id);
    const json = await withSubmitters(task);
    res.json({ success: true, data: json.TaskSubmissions });
  } catch (error) { next(error); }
};

// ─── Legacy compat ─────────────────────────────────────────────────────────
exports.reviewSubmission = exports.reviewTask;
