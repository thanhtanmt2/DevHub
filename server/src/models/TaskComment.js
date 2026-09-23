// TaskComment: discussions inside a task
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskComment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    workspace_member_id: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'task_comments', underscored: true });
};
