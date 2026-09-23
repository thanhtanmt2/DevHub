const { Project, Workspace, WorkspaceMember, User, CandidateProfile, ProjectJob, Skill } = require('../models');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activityLogger');

// POST /api/admin/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, budget, expected_end_date } = req.body;

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

// GET /api/admin/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Workspace, attributes: ['id', 'status'] },
        { 
          model: ProjectJob, 
          include: [{ model: Skill, through: { attributes: [] }, attributes: ['id', 'name'] }]
        },
        {
          model: CandidateProfile,
          as: 'Manager',
          attributes: ['id', 'professional_title'],
          include: [{ model: User, attributes: ['full_name', 'email'] }]
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
    if (!project) throw new AppError('Project not found', 404);
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
};

// PUT /api/admin/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Project not found', 404);
    
    const oldStatus = project.status;
    await project.update(req.body);

    const workspace = await Workspace.findOne({ where: { project_id: project.id } });

    await logActivity(req, {
      action: req.body.status === 'COMPLETED' || req.body.status === 'CANCELLED' ? 'PROJECT_CLOSED' : 'PROJECT_UPDATED',
      entity_type: 'project',
      entity_id: project.id,
      entity_name: project.name,
      description: `Cập nhật dự án "${project.name}"` + (req.body.status && req.body.status !== oldStatus ? ` (Trạng thái: ${req.body.status})` : ''),
      metadata: { workspace_id: workspace?.id },
    });

    res.json({ success: true, data: project });
  } catch (error) { next(error); }
};

// PUT /api/admin/projects/:id/manager
exports.updateProjectManager = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) throw new AppError('Project not found', 404);
    
    const { manager_id } = req.body;
    await project.update({ manager_id: manager_id || null });
    
    let u = null;
    const workspace = await Workspace.findOne({ where: { project_id: project.id } });

    // Auto-add manager to workspace if not already a member
    if (manager_id) {
      if (workspace) {
        const existingMember = await WorkspaceMember.findOne({
          where: { workspace_id: workspace.id, candidate_profile_id: manager_id }
        });
        if (!existingMember) {
          await WorkspaceMember.create({
            workspace_id: workspace.id,
            candidate_profile_id: manager_id,
            role: 'MANAGER',
            status: 'ACTIVE',
            joined_at: new Date()
          });
        } else if (existingMember.role !== 'MANAGER') {
           await existingMember.update({ role: 'MANAGER' });
        }
      }

      const cp = await CandidateProfile.findByPk(manager_id, { include: [{ model: User, attributes: ['id', 'full_name'] }] });
      u = cp?.User;
    }

    if (u) {
       await logActivity(req, {
        action: 'PROJECT_MANAGER_ASSIGNED',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.name,
        description: `Đã phân công ${u.full_name} làm Quản lý dự án "${project.name}"`,
        metadata: { workspace_id: workspace?.id, user_id: u.id },
        notify_user_ids: [u.id],
        notify_link: workspace ? `/candidate/workspaces/${workspace.id}` : null,
      });
    }
    
    // Return updated project with manager info
    const updatedProject = await Project.findByPk(req.params.id, {
      include: [
        {
          model: CandidateProfile,
          as: 'Manager',
          attributes: ['id', 'professional_title'],
          include: [{ model: User, attributes: ['full_name', 'email'] }]
        }
      ]
    });
    
    res.json({ success: true, data: updatedProject });
  } catch (error) { next(error); }
};

// POST /api/admin/workspaces/:id/members
exports.addWorkspaceMember = async (req, res, next) => {
  try {
    const { candidate_profile_id, project_job_id } = req.body;
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) throw new AppError('Workspace not found', 404);

    const existing = await WorkspaceMember.findOne({
      where: { workspace_id: workspace.id, candidate_profile_id }
    });
    if (existing) throw new AppError('Thành viên này đã có trong không gian làm việc', 409);

    const member = await WorkspaceMember.create({
      workspace_id: workspace.id,
      candidate_profile_id,
      project_job_id: project_job_id || null,
      status: 'ACTIVE',
      joined_at: new Date()
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
    if (!workspace) throw new AppError('Workspace not found', 404);

    // Verify access
    if (!req.userRoles?.includes('ADMIN')) {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (!profile) throw new AppError('Access denied', 403);
      
      const isMember = workspace.WorkspaceMembers.some(m => m.candidate_profile_id === profile.id);
      const isManager = workspace.Project?.manager_id === profile.id;

      if (!isMember && !isManager) throw new AppError('Access denied. Not a member or manager of this workspace', 403);
      
      const workspaceData = workspace.toJSON();
      workspaceData.isManager = isManager;
      // also mark current user's member role
      const myMember = workspace.WorkspaceMembers.find(m => m.candidate_profile_id === profile.id);
      workspaceData.myRole = myMember?.role || (isManager ? 'MANAGER' : null);
      workspaceData.myMemberId = myMember?.id || null;
      res.json({ success: true, data: workspaceData });
    } else {
      const workspaceData = workspace.toJSON();
      workspaceData.isManager = true;
      workspaceData.myRole = 'ADMIN';
      workspaceData.myMemberId = null;
      res.json({ success: true, data: workspaceData });
    }
  } catch (error) { next(error); }
};

// DELETE /api/admin/workspaces/:workspaceId/members/:memberId
exports.removeWorkspaceMember = async (req, res, next) => {
  try {
    const member = await WorkspaceMember.findOne({
      where: { id: req.params.memberId, workspace_id: req.params.workspaceId },
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });
    if (!member) throw new AppError('Member not found', 404);
    
    await member.update({ status: 'REMOVED' });

    const u = member.CandidateProfile?.User;
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

    res.json({ success: true, message: 'Member removed' });
  } catch (error) { next(error); }
};

// PUT /api/workspaces/:workspaceId/members/:memberId/role
exports.updateMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['MANAGER', 'LEAD', 'MEMBER', 'VIEWER'].includes(role)) throw new AppError('Invalid role', 400);

    const member = await WorkspaceMember.findOne({
      where: { id: req.params.memberId, workspace_id: req.params.workspaceId },
      include: [{ model: CandidateProfile, include: [{ model: User, attributes: ['id', 'full_name'] }] }]
    });
    if (!member) throw new AppError('Member not found', 404);

    const oldRole = member.role;
    await member.update({ role });

    const u = member.CandidateProfile?.User;
    if (u) {
      await logActivity(req, {
        action: 'WORKSPACE_MEMBER_ROLE_CHANGED',
        entity_type: 'workspace_member',
        entity_id: member.id,
        entity_name: u.full_name,
        old_value: oldRole,
        new_value: role,
        description: `Đã đổi vai trò của ${u.full_name} thành ${role}`,
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
    const tasks = await Task.findAll({
      where: { workspace_id: workspaceId },
      include: [{ model: WM, as: 'Assignees', through: { attributes: [] }, attributes: ['id'] }]
    });

    const now = new Date();
    const stats = {
      total: tasks.length,
      by_status: {
        TODO: tasks.filter(t => t.status === 'TODO').length,
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        REVIEW: tasks.filter(t => t.status === 'REVIEW').length,
        DONE: tasks.filter(t => t.status === 'DONE').length,
      },
      overdue: tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'DONE').length,
      due_soon: tasks.filter(t => {
        if (!t.deadline || t.status === 'DONE') return false;
        const diff = (new Date(t.deadline) - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
      }).length,
      completion_rate: tasks.length ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0,
    };

    // Per-member stats
    const members = await WM.findAll({
      where: { workspace_id: workspaceId, status: 'ACTIVE' },
      include: [{ model: CP, attributes: ['id', 'avatar_url'], include: [{ model: U, attributes: ['full_name'] }] }]
    });

    const memberStats = await Promise.all(members.map(async (m) => {
      const assigned = tasks.filter(t => t.Assignees?.some(a => a.id === m.id));
      return {
        id: m.id,
        role: m.role,
        name: m.CandidateProfile?.User?.full_name,
        total_assigned: assigned.length,
        done: assigned.filter(t => t.status === 'DONE').length,
        in_progress: assigned.filter(t => t.status === 'IN_PROGRESS').length,
        overdue: assigned.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'DONE').length,
      };
    }));

    res.json({ success: true, data: { ...stats, members: memberStats } });
  } catch (error) { next(error); }
};
