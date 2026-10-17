const { Workspace, WorkspaceMember, CandidateProfile } = require('../models');
const AppError = require('./AppError');

// Xác định quyền của user hiện tại trong một workspace.
// Mô hình quyền: Admin là chủ (toàn quyền); Admin cử Lead để phân chia công việc; còn lại là Thành viên.
// - canView: Admin hoặc thành viên đang ACTIVE
// - canManageMembers: chỉ Admin (thêm/xóa thành viên, cử/gỡ Lead)
// - canManageTasks: Admin hoặc Lead (tạo/giao/sửa/xóa task, nghiệm thu, bình luận)
// - member: bản ghi WorkspaceMember (ACTIVE) của user, null nếu là Admin/không thuộc workspace
const getWorkspaceAccess = async (req, workspaceId) => {
  const workspace = await Workspace.findByPk(workspaceId);
  if (!workspace) throw new AppError('Không tìm thấy Workspace', 404);

  const none = { workspace, member: null, canView: false, canManageMembers: false, canManageTasks: false };

  if (req.userRoles?.includes('ADMIN')) {
    return { ...none, isAdmin: true, profileId: null, canView: true, canManageMembers: true, canManageTasks: true };
  }

  const profile = await CandidateProfile.findOne({ where: { user_id: req.user.id }, attributes: ['id'] });
  if (!profile) return { ...none, isAdmin: false, profileId: null };

  const member = await WorkspaceMember.findOne({
    where: { workspace_id: workspace.id, candidate_profile_id: profile.id, status: 'ACTIVE' }
  });

  return {
    workspace,
    member,
    isAdmin: false,
    profileId: profile.id,
    canView: !!member,
    canManageMembers: false,
    canManageTasks: member?.role === 'LEAD',
  };
};

module.exports = { getWorkspaceAccess };
