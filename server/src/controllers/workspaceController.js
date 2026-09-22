const { Project, Workspace, WorkspaceMember, User, CandidateProfile, ProjectJob, Skill } = require('../models');
const AppError = require('../utils/AppError');

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
    
    await project.update(req.body);
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
    
    // Auto-add manager to workspace if not already a member
    if (manager_id) {
      const workspace = await Workspace.findOne({ where: { project_id: project.id } });
      if (workspace) {
        const existingMember = await WorkspaceMember.findOne({
          where: { workspace_id: workspace.id, candidate_profile_id: manager_id }
        });
        if (!existingMember) {
          await WorkspaceMember.create({
            workspace_id: workspace.id,
            candidate_profile_id: manager_id,
            status: 'ACTIVE',
            joined_at: new Date()
          });
        }
      }
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
              include: [{ model: User, attributes: ['full_name', 'email'] }]
            },
            { model: ProjectJob, attributes: ['id', 'title', 'budget'] }
          ]
        }
      ]
    });
    if (!workspace) throw new AppError('Workspace not found', 404);

    // Verify access
    if (req.user.role !== 'ADMIN') {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (!profile) throw new AppError('Access denied', 403);
      
      const isMember = workspace.WorkspaceMembers.some(m => m.candidate_profile_id === profile.id);
      const isManager = workspace.Project?.manager_id === profile.id;

      if (!isMember && !isManager) throw new AppError('Access denied. Not a member or manager of this workspace', 403);
      
      const workspaceData = workspace.toJSON();
      workspaceData.isManager = isManager;
      res.json({ success: true, data: workspaceData });
    } else {
      const workspaceData = workspace.toJSON();
      workspaceData.isManager = true; // Admin has full access
      res.json({ success: true, data: workspaceData });
    }
  } catch (error) { next(error); }
};

// DELETE /api/admin/workspaces/:workspaceId/members/:memberId
exports.removeWorkspaceMember = async (req, res, next) => {
  try {
    const member = await WorkspaceMember.findOne({
      where: { id: req.params.memberId, workspace_id: req.params.workspaceId }
    });
    if (!member) throw new AppError('Member not found', 404);
    
    await member.update({ status: 'REMOVED' });
    res.json({ success: true, message: 'Member removed' });
  } catch (error) { next(error); }
};
