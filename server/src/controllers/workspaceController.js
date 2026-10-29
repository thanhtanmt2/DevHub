const { Project, Workspace, WorkspaceMember, User, CandidateProfile, ProjectJob, ProjectApplication, Skill, Payment } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');
const { getWorkspaceAccess } = require('../utils/workspaceAccess');
const { createNotification } = require('./notificationController');

// Ngày (YYYY-MM-DD) theo giờ máy chủ, dùng để so sánh với các cột DATEONLY
const toDateStr = (d) => {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

// Ràng buộc dữ liệu: ngày kết thúc dự án không được trước ngày bắt đầu
const assertEndNotBeforeStart = (start, end, label) => {
  const s = toDateStr(start);
  const e = toDateStr(end);
  if (s && e && e < s) throw new AppError(`${label} không được trước ngày bắt đầu dự án (${s.split('-').reverse().join('/')})`, 400);
};

// POST /api/admin/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, budget, expected_end_date } = req.body;

    // Dự án bắt đầu từ hôm nay nên hạn hoàn thành dự kiến không thể ở quá khứ
    assertEndNotBeforeStart(new Date(), expected_end_date, 'Hạn hoàn thành dự kiến');

    const project = await Project.create({
      name,
      description,
      budget,
      expected_end_date,
      start_date: new Date(),
      status: 'RECRUITING',
      completion_rate: 0,
      created_by_user_id: req.user.id
    });

    // Auto-create workspace for project
    const workspace = await Workspace.create({
      project_id: project.id,
      name: `WS - ${name}`,
      status: 'ACTIVE'
    });

    await logActivity(req, {
      action: 'PROJECT_CREATED',
      entity_type: 'project',
      entity_id: project.id,
      entity_name: name,
      description: `Tạo dự án mới "${name}"`,
      metadata: { workspace_id: workspace.id },
    });

    res.status(201).json({ success: true, data: { project, workspace } });
  } catch (error) { next(error); }
};

// POST /api/admin/projects/:id/workspace — khởi tạo Workspace cho dự án (UC 3.3.3.16)
// Dự án đã có Workspace thì trả về Workspace hiện tại (tình huống thay thế a), không tạo trùng
exports.createProjectWorkspace = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Không tìm thấy dự án', 404);

    const [workspace, created] = await Workspace.findOrCreate({
      where: { project_id: project.id },
      defaults: { name: `WS - ${project.name}`, status: 'ACTIVE' },
    });

    if (created) {
      await logActivity(req, {
        action: 'PROJECT_UPDATED',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.name,
        description: `Khởi tạo Workspace cho dự án "${project.name}"`,
        metadata: { workspace_id: workspace.id },
      });
    }

    res.status(created ? 201 : 200).json({
      success: true,
      existed: !created,
      message: created ? 'Đã khởi tạo Workspace cho dự án' : 'Dự án đã có Workspace',
      data: workspace,
    });
  } catch (error) { next(error); }
};

// GET /api/admin/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Workspace, attributes: ['id', 'status'] },
        {
          model: ProjectJob,
          include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: projects });
  } catch (error) { next(error); }
};

// GET /api/admin/projects/:id
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Workspace },
        { 
          model: ProjectJob, 
          include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }] 
        }
      ]
    });
    if (!project) throw new AppError('Không tìm thấy dự án', 404);
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
};

// PUT /api/admin/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Không tìm thấy dự án', 404);

    // Chỉ nhận các trường cho phép sửa (không nhận id, người tạo, tỷ lệ hoàn thành do hệ thống tính...)
    const data = {};
    ['name', 'description', 'budget', 'status', 'start_date', 'expected_end_date', 'actual_end_date']
      .forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    // Ngày kết thúc không được trước ngày bắt đầu (chỉ kiểm tra khi có sửa ngày, không chặn các thay đổi khác)
    const start = data.start_date ?? project.start_date;
    if (data.status === 'COMPLETED' && !data.actual_end_date && !project.actual_end_date) {
      const today = toDateStr(new Date());
      const startStr = toDateStr(start);
      data.actual_end_date = startStr && today < startStr ? startStr : today;
    }
    if (data.start_date !== undefined || data.expected_end_date !== undefined) {
      assertEndNotBeforeStart(start, data.expected_end_date ?? project.expected_end_date, 'Hạn hoàn thành dự kiến');
    }
    if (data.start_date !== undefined || data.actual_end_date !== undefined) {
      assertEndNotBeforeStart(start, data.actual_end_date ?? project.actual_end_date, 'Ngày kết thúc thực tế');
    }

    const oldStatus = project.status;
    await project.update(data);

    const workspace = await Workspace.findOne({ where: { project_id: project.id } });

    await logActivity(req, {
      action: req.body.status === 'COMPLETED' || req.body.status === 'CANCELLED' ? 'PROJECT_CLOSED' : 'PROJECT_UPDATED',
      entity_type: 'project',
      entity_id: project.id,
      entity_name: project.name,
      description: `Cập nhật dự án "${project.name}"` + (req.body.status && req.body.status !== oldStatus ? ` (Trạng thái: ${req.body.status})` : ''),
      metadata: { workspace_id: workspace?.id },
    });

    // Tự động khởi tạo yêu cầu thanh toán thù lao khi nghiệm thu hoàn thành dự án
    let autoCreatedPayments = 0;
    if (data.status === 'COMPLETED' && oldStatus !== 'COMPLETED' && workspace) {
      const members = await WorkspaceMember.findAll({
        where: { workspace_id: workspace.id, status: { [Op.in]: ['ACTIVE', 'COMPLETED'] } },
        include: [
          { model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] },
          { model: ProjectJob, attributes: ['id', 'title', 'budget'] },
          { model: Payment, attributes: ['id', 'status'] },
        ],
      });

      for (const m of members) {
        const hasValidPayment = (m.Payments || []).some((p) => ['PENDING', 'PROCESSING', 'PAID'].includes(p.status));
        if (hasValidPayment) continue;

        const jobBudget = Number(m.ProjectJob?.budget) || 0;
        if (jobBudget < 1000) continue;

        const payment = await Payment.create({
          workspace_member_id: m.id,
          amount: jobBudget,
          payment_method: 'BANK_TRANSFER',
          status: 'PENDING',
        });
        autoCreatedPayments += 1;

        const u = m.CandidateProfile?.User;
        if (u) {
          await logActivity(req, {
            action: 'PAYMENT_CREATED',
            entity_type: 'payment',
            entity_id: payment.id,
            entity_name: `Thanh toán ${jobBudget.toLocaleString('vi-VN')}đ cho ${u.full_name}`,
            description: `Tự động tạo thanh toán ${jobBudget.toLocaleString('vi-VN')} VND cho ${u.full_name} khi nghiệm thu dự án "${project.name}"`,
            metadata: { workspace_member_id: m.id, workspace_id: workspace.id },
          });
          await createNotification({
            user_id: u.id,
            type: 'PAYMENT_UPDATE',
            title: 'Dự án hoàn thành — Có khoản thanh toán mới',
            message: `Dự án "${project.name}" đã được nghiệm thu hoàn thành. Khoản thù lao ${jobBudget.toLocaleString('vi-VN')}đ đang được chuẩn bị thanh toán cho bạn.`,
            link: '/candidate/profile?tab=payment',
            metadata: { payment_id: payment.id },
          });
        }
      }
    }

    res.json({ success: true, data: project, auto_created_payments: autoCreatedPayments });
  } catch (error) { next(error); }
};

// DELETE /api/admin/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Không tìm thấy dự án', 404);
    
    await project.destroy();

    await logActivity(req, {
      action: 'PROJECT_DELETED',
      entity_type: 'project',
      entity_id: project.id,
      entity_name: project.name,
      description: `Đã xóa dự án "${project.name}"`,
    });

    res.json({ success: true, message: 'Đã xóa dự án thành công' });
  } catch (error) { 
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return next(new AppError('Không thể xóa dự án này vì đã có dữ liệu liên quan (vị trí tuyển dụng, ứng viên, task...). Vui lòng cập nhật trạng thái dự án thành "Đã hủy" thay vì xóa.', 400));
    }
    next(error); 
  }
};

// Danh sách hồ sơ đã trúng tuyển (ACCEPTED) vào các vị trí của dự án
const getAcceptedApplications = (projectId, candidateProfileId) => ProjectApplication.findAll({
  where: { status: 'ACCEPTED', ...(candidateProfileId && { candidate_profile_id: candidateProfileId }) },
  include: [
    { model: ProjectJob, where: { project_id: projectId }, attributes: ['id', 'title'] },
    {
      model: CandidateProfile,
      attributes: ['id', 'professional_title', 'avatar_url'],
      include: [{ model: User, attributes: ['full_name', 'email'] }]
    }
  ],
  order: [['updated_at', 'DESC']]
});

// GET /api/workspaces/:id/eligible-candidates — ứng viên trúng tuyển chưa có trong workspace
exports.getEligibleCandidates = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);

    const [applications, activeMembers] = await Promise.all([
      getAcceptedApplications(workspace.project_id),
      WorkspaceMember.findAll({ where: { workspace_id: workspace.id, status: 'ACTIVE' }, attributes: ['candidate_profile_id'] })
    ]);
    const activeIds = new Set(activeMembers.map(m => m.candidate_profile_id));

    // Mỗi ứng viên chỉ hiện 1 lần (lấy hồ sơ trúng tuyển gần nhất)
    const seen = new Set();
    const candidates = [];
    for (const app of applications) {
      if (activeIds.has(app.candidate_profile_id) || seen.has(app.candidate_profile_id)) continue;
      seen.add(app.candidate_profile_id);
      candidates.push({
        candidate_profile_id: app.candidate_profile_id,
        project_job_id: app.project_job_id,
        job_title: app.ProjectJob?.title,
        full_name: app.CandidateProfile?.User?.full_name,
        email: app.CandidateProfile?.User?.email,
        professional_title: app.CandidateProfile?.professional_title,
      });
    }

    res.json({ success: true, data: candidates });
  } catch (error) { next(error); }
};

// POST /api/workspaces/:id/members (Admin)
exports.addWorkspaceMember = async (req, res, next) => {
  try {
    const { candidate_profile_id, project_job_id, role } = req.body;
    if (role && !ASSIGNABLE_ROLES.includes(role)) throw new AppError('Vai trò không hợp lệ (chỉ có Lead hoặc Thành viên)', 400);
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);

    // Chỉ cho phép thêm ứng viên đã trúng tuyển vào dự án này
    const accepted = await getAcceptedApplications(workspace.project_id, candidate_profile_id);
    if (!accepted.length) {
      throw new AppError('Ứng viên không hợp lệ: chưa trúng tuyển vào dự án này', 400);
    }
    const jobId = project_job_id && accepted.some(a => a.project_job_id === project_job_id)
      ? project_job_id
      : accepted[0].project_job_id;

    const existing = await WorkspaceMember.findOne({
      where: { workspace_id: workspace.id, candidate_profile_id }
    });
    if (existing?.status === 'ACTIVE') throw new AppError('Thành viên này đã có trong không gian làm việc', 409);

    // Thành viên từng bị xóa/đã kết thúc → kích hoạt lại thay vì tạo bản ghi mới
    const member = existing
      ? await existing.update({ status: 'ACTIVE', role: role || 'MEMBER', project_job_id: jobId, joined_at: new Date() })
      : await WorkspaceMember.create({
          workspace_id: workspace.id,
          candidate_profile_id,
          project_job_id: jobId,
          role: role || 'MEMBER',
          status: 'ACTIVE',
          joined_at: new Date()
        }).catch((err) => {
          // Hai yêu cầu thêm cùng lúc: ràng buộc unique của DB chặn bản ghi thứ hai
          if (err.name === 'SequelizeUniqueConstraintError') throw new AppError('Thành viên này đã có trong không gian làm việc', 409);
          throw err;
        });

    const cp = await CandidateProfile.findByPk(candidate_profile_id, { include: [{ model: User, attributes: ['id', 'full_name'] }] });
    const u = cp?.User;

    if (u) {
      await logActivity(req, {
        action: 'WORKSPACE_MEMBER_ADDED',
        entity_type: 'workspace_member',
        entity_id: member.id,
        entity_name: u.full_name,
        description: `Đã thêm ${u.full_name} vào workspace`,
        metadata: { workspace_id: workspace.id, user_id: u.id },
        notify_user_ids: [u.id],
        notify_link: `/candidate/workspaces/${workspace.id}`,
      });
    }

    res.status(201).json({ success: true, data: member });
  } catch (error) { next(error); }
};

// GET /api/workspaces/:id — (Admin and Members can view)
exports.getWorkspaceDetail = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id, {
      include: [
        { model: Project },
        { 
          model: WorkspaceMember,
          include: [
            {
              model: CandidateProfile,
              attributes: ['id', 'professional_title', 'avatar_url', 'user_id'],
              include: [{ model: User, attributes: ['full_name', 'email'] }]
            },
            { model: ProjectJob, attributes: ['id', 'title', 'budget'] }
          ],
          where: { status: 'ACTIVE' },
          required: false
        }
      ]
    });
    if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);

    // Verify access
    if (!req.userRoles?.includes('ADMIN')) {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (!profile) throw new AppError('Bạn không có quyền truy cập', 403);
      
      const myMember = workspace.WorkspaceMembers.find(m => m.candidate_profile_id === profile.id);
      if (!myMember) throw new AppError('Bạn không phải thành viên của Workspace này', 403);

      const workspaceData = workspace.toJSON();
      workspaceData.myRole = myMember.role; // LEAD | MEMBER
      workspaceData.myMemberId = myMember.id;
      res.json({ success: true, data: workspaceData });
    } else {
      const workspaceData = workspace.toJSON();
      workspaceData.myRole = 'ADMIN';
      workspaceData.myMemberId = null;
      res.json({ success: true, data: workspaceData });
    }
  } catch (error) { next(error); }
};

// DELETE /api/workspaces/:workspaceId/members/:memberId (chỉ Admin — chủ dự án)
exports.removeWorkspaceMember = async (req, res, next) => {
  try {
    const access = await getWorkspaceAccess(req, req.params.workspaceId);
    if (!access.canManageMembers) throw new AppError('Chỉ Admin mới có quyền xóa thành viên khỏi Workspace', 403);

    const member = await WorkspaceMember.findOne({
      where: { id: req.params.memberId, workspace_id: req.params.workspaceId, status: 'ACTIVE' },
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });
    if (!member) throw new AppError('Không tìm thấy thành viên', 404);

    await member.update({ status: 'REMOVED' });

    const u = member.CandidateProfile?.User;

    // Gỡ thành viên khỏi các task chưa nghiệm thu (task đã Hoàn thành giữ nguyên để làm lịch sử).
    // Task đang làm / chờ duyệt mà không còn ai thực hiện thì đưa về "Cần làm".
    const { Task, TaskAssignee, TaskActivity } = require('../models');
    const assigned = await TaskAssignee.findAll({
      where: { workspace_member_id: member.id },
      include: [{ model: Task, attributes: ['id', 'status', 'workspace_id'] }]
    });
    for (const a of assigned) {
      const task = a.Task;
      if (!task || task.status === 'DONE') continue;
      await TaskAssignee.destroy({ where: { task_id: task.id, workspace_member_id: member.id } });
      const remaining = await TaskAssignee.count({ where: { task_id: task.id } });
      let description = `Gỡ ${u?.full_name || 'thành viên'} khỏi task do rời Workspace`;
      if (!remaining && task.status !== 'TODO') {
        const maxPos = await Task.max('position', { where: { workspace_id: task.workspace_id, status: 'TODO' } });
        await task.update({ status: 'TODO', review_status: 'PENDING', position: (maxPos ?? -1) + 1 });
        description += ', task được đưa về "Cần làm"';
      }
      await TaskActivity.create({
        task_id: task.id,
        workspace_member_id: access.member?.id || null,
        action: 'ASSIGNED',
        description,
      }).catch(() => {});
    }
    if (u) {
      await logActivity(req, {
        action: 'WORKSPACE_MEMBER_REMOVED',
        entity_type: 'workspace_member',
        entity_id: member.id,
        entity_name: u.full_name,
        description: `Đã xóa ${u.full_name} khỏi workspace`,
        metadata: { workspace_id: req.params.workspaceId, user_id: u.id },
        notify_user_ids: [u.id],
      });
    }

    res.json({ success: true, message: 'Đã gỡ thành viên khỏi Workspace' });
  } catch (error) { next(error); }
};

// PUT /api/workspaces/:workspaceId/members/:memberId/role
// Vai trò trong Workspace: Admin (chủ) cử Lead để phân chia công việc; còn lại là Thành viên.
const ASSIGNABLE_ROLES = ['LEAD', 'MEMBER'];
const ROLE_VI = { LEAD: 'Lead', MEMBER: 'Thành viên' };
const ROLE_HINT = {
  LEAD: 'Bạn có thể tạo task, phân công việc cho thành viên, chỉnh sửa, nghiệm thu công việc và bình luận trong task.',
  MEMBER: 'Bạn thực hiện các task được giao, nộp sản phẩm và phản hồi bình luận của Lead/Admin trong task của mình.',
};

exports.updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!ASSIGNABLE_ROLES.includes(role)) {
      throw new AppError('Vai trò không hợp lệ. Chỉ có Lead hoặc Thành viên', 400);
    }

    const access = await getWorkspaceAccess(req, req.params.workspaceId);
    if (!access.canManageMembers) throw new AppError('Chỉ Admin mới có quyền cử hoặc gỡ Lead', 403);

    const member = await WorkspaceMember.findOne({
      where: { id: req.params.memberId, workspace_id: req.params.workspaceId, status: 'ACTIVE' },
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });
    if (!member) throw new AppError('Không tìm thấy thành viên', 404);

    const oldRole = member.role;
    if (oldRole === role) return res.json({ success: true, data: member });
    await member.update({ role });

    const u = member.CandidateProfile?.User;
    if (u) {
      const projectName = access.workspace?.name || 'dự án';
      await logActivity(req, {
        action: 'WORKSPACE_MEMBER_ROLE_CHANGED',
        entity_type: 'workspace_member',
        entity_id: member.id,
        entity_name: u.full_name,
        old_value: oldRole,
        new_value: role,
        description: `Đã đổi vai trò của ${u.full_name} thành ${ROLE_VI[role]}`,
        // Người được đổi vai trò nhận thông báo + email nói rõ vai trò mới và quyền hạn
        notify_message: `${req.user?.full_name || 'Quản trị viên'} đã đổi vai trò của bạn trong Workspace "${projectName}" thành ${ROLE_VI[role]}.\n${ROLE_HINT[role]}`,
        metadata: { workspace_id: req.params.workspaceId, user_id: u.id },
        notify_user_ids: [u.id],
        notify_link: `/candidate/workspaces/${req.params.workspaceId}`,
      });
    }

    res.json({ success: true, data: member });
  } catch (error) { next(error); }
};

// GET /api/workspaces/:id/stats
exports.getWorkspaceStats = async (req, res, next) => {
  try {
    const { Task, TaskAssignee, WorkspaceMember: WM, CandidateProfile: CP, User: U } = require('../models');
    const { Op } = require('sequelize');

    const workspaceId = req.params.id;
    const access = await getWorkspaceAccess(req, workspaceId);
    if (!access.canView) throw new AppError('Bạn không phải thành viên của Workspace này', 403);

    const tasks = await Task.findAll({
      where: { workspace_id: workspaceId },
      include: [{
        model: WM, as: 'Assignees', through: { attributes: [] }, attributes: ['id'],
        include: [{ model: CP, attributes: ['id'], include: [{ model: U, attributes: ['full_name'] }] }],
      }],
    });

    const now = new Date();
    // Deadline tính hết ngày; chỉ task chưa gửi duyệt (Cần làm / Đang làm) mới bị coi là quá hạn
    const deadlineEnd = (d) => { const end = new Date(d); end.setHours(23, 59, 59, 999); return end; };
    const isOpen = (t) => ['TODO', 'IN_PROGRESS'].includes(t.status);
    const isOverdue = (t) => t.deadline && isOpen(t) && deadlineEnd(t.deadline) < now;
    const daysLeft = (t) => (deadlineEnd(t.deadline) - now) / (1000 * 60 * 60 * 24);
    const isDueSoon = (t) => t.deadline && isOpen(t) && daysLeft(t) >= 0 && daysLeft(t) <= 3;
    const activeTasks = tasks.filter(t => t.status !== 'CANCELLED');
    const stats = {
      total: activeTasks.length,
      by_status: {
        TODO: tasks.filter(t => t.status === 'TODO').length,
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
        DONE: tasks.filter(t => t.status === 'DONE').length,
      },
      overdue: tasks.filter(isOverdue).length,
      due_soon: tasks.filter(isDueSoon).length,
      // Việc cần chú ý: quá hạn và sắp đến hạn (3 ngày tới), gần hạn nhất lên trước
      attention: tasks
        .filter(t => isOverdue(t) || isDueSoon(t))
        .sort((x, y) => new Date(x.deadline) - new Date(y.deadline))
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          overdue: !!isOverdue(t),
          assignees: (t.Assignees || []).map(a => a.CandidateProfile?.User?.full_name).filter(Boolean),
        })),
    };

    // Khối lượng việc của từng thành viên (giống "Workload" trong Jira)
    const members = await WM.findAll({
      where: { workspace_id: workspaceId, status: 'ACTIVE' },
      include: [{ model: CP, attributes: ['id', 'avatar_url'], include: [{ model: U, attributes: ['full_name'] }] }]
    });

    const memberStats = members.map((m) => {
      const assigned = tasks.filter(t => t.status !== 'CANCELLED' && t.Assignees?.some(a => a.id === m.id));
      return {
        id: m.id,
        role: m.role,
        name: m.CandidateProfile?.User?.full_name,
        total_assigned: assigned.length,
        todo: assigned.filter(t => t.status === 'TODO').length,
        in_progress: assigned.filter(t => t.status === 'IN_PROGRESS').length,
        review: assigned.filter(t => t.status === 'REVIEW').length,
        done: assigned.filter(t => t.status === 'DONE').length,
        overdue: assigned.filter(isOverdue).length,
      };
    });
    // Người đang có nhiều việc chưa xong nhất lên trước
    memberStats.sort((x, y) => (y.todo + y.in_progress + y.review) - (x.todo + x.in_progress + x.review));

    res.json({ success: true, data: { ...stats, members: memberStats } });
  } catch (error) { next(error); }
};
