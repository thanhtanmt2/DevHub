const { Workspace, WorkspaceMember, CandidateProfile, Project } = require('../models');
const AppError = require('./AppError');

// Xác định quyền của user hiện tại trong một workspace
// - canView: Admin, Quản lý dự án hoặc thành viên đang ACTIVE
// - canManageMembers: Admin, Quản lý dự án hoặc thành viên có vai trò MANAGER
const getWorkspaceAccess = async (req, workspaceId) => {
  const workspace = await Workspace.findByPk(workspaceId, {
    include: [{ model: Project, attributes: ['id', 'manager_id'] }]
  });
  if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);

  const projectManagerId = workspace.Project?.manager_id || null;

  if (req.userRoles?.includes('ADMIN')) {
    return { workspace, projectManagerId, isAdmin: true, profileId: null, canView: true, canManageMembers: true };
  }

  const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id }, attributes: ['id'] });
  if (!profile) {
    return { workspace, projectManagerId, isAdmin: false, profileId: null, canView: false, canManageMembers: false };
  }

  const member = await WorkspaceMember.findOne({
    where: { workspace_id: workspace.id, candidate_profile_id: profile.id, status: 'ACTIVE' }
  });
  const isProjectManager = projectManagerId === profile.id;

  return {
    workspace,
    projectManagerId,
    isAdmin: false,
    profileId: profile.id,
    canView: isProjectManager || !!member,
    canManageMembers: isProjectManager || member?.role === 'MANAGER',
  };
};

module.exports = { getWorkspaceAccess };
