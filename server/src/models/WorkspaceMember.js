module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WorkspaceMember', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_id: { type: DataTypes.UUID, allowNull: false },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    project_job_id: { type: DataTypes.UUID },
    // Admin là chủ; Admin cử LEAD để phân chia công việc, còn lại là MEMBER.
    // (Vai trò MANAGER "Quản lý dự án" và VIEWER "Xem" đã bỏ — xem migrate_remove_manager_viewer.cjs)
    role: {
      type: DataTypes.ENUM('LEAD', 'MEMBER'),
      defaultValue: 'MEMBER'
    },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'REMOVED'), defaultValue: 'ACTIVE' },
  }, { tableName: 'workspace_members', underscored: true, timestamps: false });
};
