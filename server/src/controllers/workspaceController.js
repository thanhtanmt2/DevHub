const { InternalProject, Workspace, WorkspaceMember, User, CandidateProfile, JobPost } = require('../models');
const AppError = require('../utils/AppError');

// POST /api/admin/projects
exports.createProject = async (req, res, next) => {
  try {
    const { job_post_id, name, description, budget, expected_end_date } = req.body;
    
    // Check if job exists and is internal
    if (job_post_id) {
      const job = await JobPost.findByPk(job_post_id);
      if (!job || job.post_type !== 'INTERNAL') throw new AppError('Invalid job post', 400);
    }

    const project = await InternalProject.create({
      job_post_id: job_post_id || null,
      name, description, budget, expected_end_date,
      start_date: new Date(),
      status: 'PLANNING',
      completion_rate: 0
    });

    // Auto-create workspace for project
    const workspace = await Workspace.create({
      internal_project_id: project.id,
      name: `WS - ${name}`,
      status: 'ACTIVE'
    });

    res.status(201).json({ success: true, data: { project, workspace } });
  } catch (error) { next(error); }
};

// GET /api/admin/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await InternalProject.findAll({
      include: [
        { model: Workspace, attributes: ['id', 'status'] },
        { model: JobPost, attributes: ['id', 'title'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: projects });
  } catch (error) { next(error); }
};

// GET /api/admin/projects/:id
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await InternalProject.findByPk(req.params.id, {
      include: [{ model: Workspace }]
    });
    if (!project) throw new AppError('Project not found', 404);
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
};

// PUT /api/admin/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await InternalProject.findByPk(req.params.id);
    if (!project) throw new AppError('Project not found', 404);
    
    await project.update(req.body);
    res.json({ success: true, data: project });
  } catch (error) { next(error); }
};

// POST /api/admin/workspaces/:id/members
exports.addWorkspaceMember = async (req, res, next) => {
  try {
    const { candidate_profile_id, role, start_date } = req.body;
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) throw new AppError('Workspace not found', 404);

    const existing = await WorkspaceMember.findOne({
      where: { workspace_id: workspace.id, candidate_profile_id }
    });
    if (existing) throw new AppError('Member already in workspace', 409);

    const member = await WorkspaceMember.create({
      workspace_id: workspace.id,
      candidate_profile_id,
      role: role || 'MEMBER',
      start_date: start_date || new Date(),
      status: 'ACTIVE'
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) { next(error); }
};

// GET /api/workspaces/:id — (Admin and Members can view)
exports.getWorkspaceDetail = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id, {
      include: [
        { model: InternalProject },
        { 
          model: WorkspaceMember,
          include: [{
            model: CandidateProfile,
            include: [{ model: User, attributes: ['full_name', 'email'] }]
          }]
        }
      ]
    });
    if (!workspace) throw new AppError('Workspace not found', 404);

    // Verify access
    if (req.user.role !== 'ADMIN') {
      const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
      if (!profile) throw new AppError('Access denied', 403);
      
      const isMember = workspace.WorkspaceMembers.some(m => m.candidate_profile_id === profile.id);
      if (!isMember) throw new AppError('Access denied. Not a member of this workspace', 403);
    }

    res.json({ success: true, data: workspace });
  } catch (error) { next(error); }
};

// DELETE /api/admin/workspaces/:workspaceId/members/:memberId
exports.removeWorkspaceMember = async (req, res, next) => {
  try {
    const member = await WorkspaceMember.findOne({
      where: { id: req.params.memberId, workspace_id: req.params.workspaceId }
    });
    if (!member) throw new AppError('Member not found', 404);
    
    await member.update({ status: 'LEFT', end_date: new Date() });
    res.json({ success: true, message: 'Member removed/left' });
  } catch (error) { next(error); }
};
