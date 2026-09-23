// TaskActivity: activity log / history tracking
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskActivity', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    workspace_member_id: { type: DataTypes.UUID }, // null = system action
    action: { type: DataTypes.STRING(100), allowNull: false }, // e.g. 'STATUS_CHANGED', 'ASSIGNED', 'COMMENT_ADDED'
    old_value: { type: DataTypes.TEXT },
    new_value: { type: DataTypes.TEXT },
    description: { type: DataTypes.STRING(500) },
  }, { tableName: 'task_activities', underscored: true, updatedAt: false });
};
