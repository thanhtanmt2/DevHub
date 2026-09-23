module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WorkspaceMember', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_id: { type: DataTypes.UUID, allowNull: false },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    project_job_id: { type: DataTypes.UUID },
    role: { 
      type: DataTypes.ENUM('MANAGER', 'LEAD', 'MEMBER', 'VIEWER'), 
      defaultValue: 'MEMBER' 
    },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'REMOVED'), defaultValue: 'ACTIVE' },
  }, { tableName: 'workspace_members', underscored: true, timestamps: false });
};
