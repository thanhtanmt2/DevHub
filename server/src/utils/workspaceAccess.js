const { Workspace, WorkspaceMember, CandidateProfile, Project } = require('../models');
const AppError = require('./AppError');

// Xác định quyền của user hiện tại trong một workspace
// - canView: Admin, Quản lý dự án hoặc thành viên đang ACTIVE
// - canManageMembers: Admin, Quản lý dự án hoặc thành viên có vai trò MANAGER
// - canManageTasks: Admin, Quản lý dự án hoặc thành viên có vai trò MANAGER/LEAD
// - member: bản ghi WorkspaceMember (ACTIVE) của user, null nếu là Admin/không thuộc workspace
const getWorkspaceAccess = async (req, workspaceId) => {
  const workspace = await Workspace.findByPk(workspaceId, {
    include: [{ model: Project, attributes: ['id', 'manager_id'] }]
  });
  if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);

  const projectManagerId = workspace.Project?.manager_id || null;
  const none = { workspace, projectManagerId, member: null, canView: false, canManageMembers: false, canManageTasks: false };

  if (req.userRoles?.includes('ADMIN')) {
    return { ...none, isAdmin: true, profileId: null, canView: true, canManageMembers: true, canManageTasks: true };
  }

  const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id }, attributes: ['id'] });
  if (!profile) return { ...none, isAdmin: false, profileId: null };

  const member = await WorkspaceMember.findOne({
    where: { workspace_id: workspace.id, candidate_profile_id: profile.id, status: 'ACTIVE' }
  });
  const isProjectManager = projectManagerId === profile.id;

  return {
    workspace,
    projectManagerId,
    member,
    isAdmin: false,
    profileId: profile.id,
    canView: isProjectManager || !!member,
    canManageMembers: isProjectManager || member?.role === 'MANAGER',
    canManageTasks: isProjectManager || ['MANAGER', 'LEAD'].includes(member?.role),
  };
};

module.exports = { getWorkspaceAccess };
