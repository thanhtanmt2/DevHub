const { 
  Task, TaskAssignee, SubTask, TaskComment, TaskActivity,
  Workspace, WorkspaceMember, CandidateProfile, User
} = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const notifCtrl = require('./notificationController');
const { logActivity } = require('../utils/activityLogger');

// Helper: get current user's WorkspaceMember record
async function getMember(userId, workspaceId) {
  const profile = await CandidateProfile.findOne({ where: { user_id: userId } });
  if (!profile) return null;
  return WorkspaceMember.findOne({
    where: { workspace_id: workspaceId, candidate_profile_id: profile.id, status: 'ACTIVE' }
  });
}

// Helper: log activity
async function logInternalTaskActivity(taskId, memberId, action, description, oldVal = null, newVal = null) {
  await TaskActivity.create({
    task_id: taskId,
    workspace_member_id: memberId || null,
    action,
    old_value: oldVal ? String(oldVal) : null,
    new_value: newVal ? String(newVal) : null,
    description,
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
    order: [['position', 'ASC']],
    attributes: ['id', 'title', 'is_done', 'position']
  },
  {
    model: TaskComment,
    as: 'Comments',
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
    include: [{
      model: WorkspaceMember,
      as: 'Actor',
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['full_name'] }], attributes: ['avatar_url'] }],
      attributes: ['id']
    }],
    order: [['created_at', 'DESC']],
    limit: 50,
    attributes: ['id', 'action', 'old_value', 'new_value', 'description', 'created_at']
  }
];

// ─── GET /api/tasks/workspace/:workspaceId ─────────────────────────────────
exports.getWorkspaceTasks = async (req, res, next) => {
  try {
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
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
};

// ─── POST /api/tasks/workspace/:workspaceId ────────────────────────────────
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, deadline, estimated_hours, labels, assignee_ids, sub_tasks } = req.body;
    const workspaceId = req.params.workspaceId;

    // Determine position (put at bottom of TODO column)
    const count = await Task.count({ where: { workspace_id: workspaceId, status: 'TODO' } });

    const task = await Task.create({
      workspace_id: workspaceId,
      title, description,
      priority: priority || 'MEDIUM',
      deadline, estimated_hours,
      labels: labels || [],
      status: 'TODO',
      position: count,
    });

    // Assign members
    if (assignee_ids?.length) {
      await TaskAssignee.bulkCreate(
        assignee_ids.map(wm_id => ({ task_id: task.id, workspace_member_id: wm_id })),
        { ignoreDuplicates: true }
      );
    }

    // Create sub-tasks
    if (sub_tasks?.length) {
      await SubTask.bulkCreate(
        sub_tasks.map((st, i) => ({ task_id: task.id, title: st, position: i }))
      );
    }

    // Get member for activity log
    let member = null;
    if (!req.userRoles?.includes('ADMIN')) {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (profile) member = await WorkspaceMember.findOne({ where: { workspace_id: workspaceId, candidate_profile_id: profile.id } });
    }

    await logInternalTaskActivity(task.id, member?.id, 'TASK_CREATED', `Tạo task: ${title}`);

    // Send notifications to assignees
    if (assignee_ids?.length) {
      const assigneeMembers = await WorkspaceMember.findAll({
        where: { id: { [Op.in]: assignee_ids } },
        include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id'] }], attributes: ['id'] }]
      });
      for (const am of assigneeMembers) {
        const uid = am.CandidateProfile?.User?.id;
        if (uid && uid !== req.user.id) {
          await notifCtrl.createNotification({
            user_id: uid,
            type: 'TASK_ASSIGNED',
            title: '📌 Bạn được giao task mới',
            message: `Task: "${title}" đã được giao cho bạn`,
            link: `/candidate/workspaces/${workspaceId}`,
            metadata: { task_id: task.id, workspace_id: workspaceId }
          });
        }
      }
    }

    // Get assignees' user_ids for notification
    const assigneeUserIds = [];
    if (assignee_ids?.length) {
      const ams = await WorkspaceMember.findAll({
        where: { id: { [Op.in]: assignee_ids } },
        include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id'] }], attributes: ['id'] }]
      });
      ams.forEach(am => { if (am.CandidateProfile?.User?.id) assigneeUserIds.push(am.CandidateProfile.User.id); });
    }

    await logActivity(req, {
      action: 'TASK_CREATED',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: title,
      description: `Tạo task "${title}" trong workspace`,
      metadata: { workspace_id: workspaceId },
      notify_user_ids: assigneeUserIds,
      notify_link: `/candidate/workspaces/${workspaceId}`,
    });

    const fullTask = await Task.findByPk(task.id, { include: TASK_INCLUDE });
    res.status(201).json({ success: true, data: fullTask });
  } catch (error) { next(error); }
};

// ─── PUT /api/tasks/:id ─────────────────────────────────────────────────────
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);

    const isAdmin = req.userRoles?.includes('ADMIN');
    let member = null;
    if (!isAdmin) {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (profile) member = await WorkspaceMember.findOne({ where: { workspace_id: task.workspace_id, candidate_profile_id: profile.id } });
    }

    const { title, description, priority, deadline, estimated_hours, actual_hours, labels, status, completion_rate, assignee_ids } = req.body;
    
    // Track changes for activity log
    const changes = [];
    const updateData = {};

    if (isAdmin || member?.role === 'MANAGER' || member?.role === 'LEAD') {
      // Managers/Leads can edit everything
      if (title !== undefined) { changes.push({ action: 'TITLE_CHANGED', old: task.title, new: title, desc: `Đổi tiêu đề thành "${title}"` }); updateData.title = title; }
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) { changes.push({ action: 'PRIORITY_CHANGED', old: task.priority, new: priority, desc: `Đổi độ ưu tiên: ${task.priority} → ${priority}` }); updateData.priority = priority; }
      if (deadline !== undefined) updateData.deadline = deadline || null;
      if (estimated_hours !== undefined) updateData.estimated_hours = estimated_hours || null;
      if (labels !== undefined) updateData.labels = labels;
      
      // Update assignees
      if (assignee_ids !== undefined) {
        await TaskAssignee.destroy({ where: { task_id: task.id } });
        if (assignee_ids.length) {
          await TaskAssignee.bulkCreate(
            assignee_ids.map(wm_id => ({ task_id: task.id, workspace_member_id: wm_id })),
            { ignoreDuplicates: true }
          );
        }
        changes.push({ action: 'ASSIGNEES_CHANGED', desc: 'Cập nhật danh sách người được giao' });
      }
    } else {
      // Normal members can assign themselves if the task is currently unassigned
      if (assignee_ids !== undefined && member) {
        const existingAssignees = await TaskAssignee.count({ where: { task_id: task.id } });
        if (existingAssignees === 0 && assignee_ids.length === 1 && assignee_ids[0] === member.id) {
          await TaskAssignee.create({ task_id: task.id, workspace_member_id: member.id });
          changes.push({ action: 'ASSIGNEES_CHANGED', desc: 'Đã nhận task' });
        } else if (assignee_ids.length > 0) {
          // If they try to assign someone else or the task is already assigned
          throw new AppError('Bạn không có quyền thay đổi người thực hiện của task này', 403);
        }
      }
    }

    // All members can update status and completion_rate for their own tasks
    if (status !== undefined && status !== task.status) {
      // Check if member is assigned to this task
      const isAssigned = isAdmin || member?.role === 'MANAGER' || member?.role === 'LEAD' ||
        (member && await TaskAssignee.findOne({ where: { task_id: task.id, workspace_member_id: member.id } }));
      
      if (!isAssigned) throw new AppError('Bạn không được phân công task này', 403);
      
      changes.push({ action: 'STATUS_CHANGED', old: task.status, new: status, desc: `Chuyển trạng thái: ${task.status} → ${status}` });
      updateData.status = status;
      if (status === 'DONE') { updateData.completion_rate = 100; }
    }
    if (completion_rate !== undefined) updateData.completion_rate = completion_rate;
    if (actual_hours !== undefined) updateData.actual_hours = actual_hours;

    await task.update(updateData);

    // Central activity log for each change
    for (const change of changes) {
      await logActivity(req, {
        action: change.action === 'STATUS_CHANGED' ? 'TASK_STATUS_CHANGED' : 'TASK_UPDATED',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        old_value: change.old,
        new_value: change.new,
        description: change.desc,
        metadata: { workspace_id: task.workspace_id },
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
// Manager reviews task when it's in REVIEW status → Approve or Request Revision
exports.reviewTask = async (req, res, next) => {
  try {
    const { action, review_note } = req.body; // action: 'APPROVE' | 'REVISION'
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    if (task.status !== 'REVIEW') throw new AppError('Task chưa ở trạng thái chờ duyệt', 400);

    let member = null;
    if (!req.userRoles?.includes('ADMIN')) {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (profile) member = await WorkspaceMember.findOne({ where: { workspace_id: task.workspace_id, candidate_profile_id: profile.id } });
      if (!member || !['MANAGER', 'LEAD'].includes(member.role)) {
        throw new AppError('Chỉ Manager hoặc Lead mới có quyền duyệt task', 403);
      }
    }

    const updateData = {
      review_note,
      reviewed_by: member?.id || null,
      reviewed_at: new Date(),
    };

    if (action === 'APPROVE') {
      updateData.status = 'DONE';
      updateData.review_status = 'APPROVED';
      updateData.completion_rate = 100;

      // Get assignees for notification
      const assignees = await TaskAssignee.findAll({
        where: { task_id: task.id },
        include: [{ model: WorkspaceMember, include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id'] }] }] }]
      });
      const notifyIds = assignees.map(a => a.WorkspaceMember?.CandidateProfile?.User?.id).filter(Boolean);

      await logActivity(req, {
        action: 'TASK_APPROVED',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        description: review_note || `Task "${task.title}" đã được duyệt ✅`,
        metadata: { workspace_id: task.workspace_id },
        notify_user_ids: notifyIds,
        notify_link: `/candidate/workspaces/${task.workspace_id}`,
      });

    } else if (action === 'REVISION') {
      updateData.status = 'IN_PROGRESS';
      updateData.review_status = 'REVISION_REQUIRED';

      const assignees = await TaskAssignee.findAll({
        where: { task_id: task.id },
        include: [{ model: WorkspaceMember, include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id'] }] }] }]
      });
      const notifyIds = assignees.map(a => a.WorkspaceMember?.CandidateProfile?.User?.id).filter(Boolean);

      await logActivity(req, {
        action: 'TASK_REVISION_REQUESTED',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        description: `Yêu cầu chỉnh sửa task "${task.title}": ${review_note}`,
        metadata: { workspace_id: task.workspace_id },
        notify_user_ids: notifyIds,
        notify_link: `/candidate/workspaces/${task.workspace_id}`,
      });
    } else {
      throw new AppError('Action phải là APPROVE hoặc REVISION', 400);
    }

    await task.update(updateData);
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

exports.addSubTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    const count = await SubTask.count({ where: { task_id: task.id } });
    const sub = await SubTask.create({ task_id: task.id, title: req.body.title, position: count });
    await updateTaskProgress(task.id);
    res.status(201).json({ success: true, data: sub });
  } catch (error) { next(error); }
};

exports.updateSubTask = async (req, res, next) => {
  try {
    const sub = await SubTask.findByPk(req.params.subId);
    if (!sub) throw new AppError('SubTask not found', 404);
    await sub.update(req.body);
    await updateTaskProgress(sub.task_id);
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
};

exports.deleteSubTask = async (req, res, next) => {
  try {
    const sub = await SubTask.findByPk(req.params.subId);
    if (!sub) throw new AppError('SubTask not found', 404);
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

    let member = null;
    if (!req.userRoles?.includes('ADMIN')) {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (profile) member = await WorkspaceMember.findOne({ where: { workspace_id: task.workspace_id, candidate_profile_id: profile.id } });
      if (!member) throw new AppError('Bạn không phải thành viên workspace này', 403);
    }

    const comment = await TaskComment.create({
      task_id: task.id,
      workspace_member_id: member?.id || null,
      content: req.body.content,
    });

    await logActivity(req, {
      action: 'TASK_COMMENTED',
      entity_type: 'task',
      entity_id: task.id,
      entity_name: task.title,
      description: `Bình luận mới trong task "${task.title}": "${req.body.content?.substring(0, 100)}"`,
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
    const comment = await TaskComment.findByPk(req.params.commentId);
    if (!comment) throw new AppError('Comment not found', 404);
    await comment.destroy();
    res.json({ success: true, message: 'Đã xóa bình luận' });
  } catch (error) { next(error); }
};

// ─── Reorder tasks (drag & drop) ────────────────────────────────────────────
exports.reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // [{id, position, status}]
    await Promise.all(tasks.map(t => Task.update({ position: t.position, status: t.status }, { where: { id: t.id } })));
    res.json({ success: true });
  } catch (error) { next(error); }
};

// ─── Legacy compat ─────────────────────────────────────────────────────────
exports.reviewSubmission = exports.reviewTask;
exports.submitTask = async (req, res, next) => {
  // Redirect to status change
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) throw new AppError('Task not found', 404);
    await task.update({ status: 'REVIEW' });
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
};
exports.getTaskSubmissions = async (req, res, next) => res.json({ success: true, data: [] });
