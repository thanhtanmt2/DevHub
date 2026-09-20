module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Task', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_id: { type: DataTypes.UUID, allowNull: false },
    assignee_member_id: { type: DataTypes.UUID },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    priority: { type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'MEDIUM' },
    deadline: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('TODO', 'DOING', 'DONE'), defaultValue: 'TODO' },
    completion_percentage: { type: DataTypes.SMALLINT, defaultValue: 0, validate: { min: 0, max: 100 } },
  }, { tableName: 'tasks', underscored: true });
};
