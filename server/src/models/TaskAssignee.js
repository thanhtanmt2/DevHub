// TaskAssignee: many-to-many Task <-> WorkspaceMember
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskAssignee', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    workspace_member_id: { type: DataTypes.UUID, allowNull: false },
  }, { tableName: 'task_assignees', underscored: true, timestamps: false });
};
