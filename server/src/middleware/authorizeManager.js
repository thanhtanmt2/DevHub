const { Project, Workspace, CandidateProfile, ProjectApplication, ProjectJob, Task } = require('../models');
const AppError = require('../utils/AppError');

exports.authorizeManager = async (req, res, next) => {
  try {
    const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) throw new AppError('Profile not found', 404);

    let projectId = req.params.projectId || req.body.projectId;

    // Check workspaceId
    if (!projectId && (req.params.workspaceId || req.body.workspaceId)) {
      const wsId = req.params.workspaceId || req.body.workspaceId;
      const workspace = await Workspace.findByPk(wsId);
      if (workspace) projectId = workspace.project_id;
    }

    // Check applicationId
    if (!projectId && (req.params.applicationId)) {
      const app = await ProjectApplication.findByPk(req.params.applicationId, {
        include: [{ model: ProjectJob }]
      });
      if (app && app.ProjectJob) projectId = app.ProjectJob.project_id;
    }

    // Check taskId (for review task)
    if (!projectId && req.params.taskId) {
      const task = await Task.findByPk(req.params.taskId, {
        include: [{ model: Workspace }]
      });
      if (task && task.Workspace) projectId = task.Workspace.project_id;
    }

    if (!projectId) throw new AppError('Unable to identify project for authorization', 400);

    const project = await Project.findByPk(projectId);
    if (!project || project.manager_id !== profile.id) {
      throw new AppError('Access denied: You are not the manager of this project', 403);
    }

    req.candidateProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
};
