// SubTask: small checklist items inside a Task
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SubTask', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    is_done: { type: DataTypes.BOOLEAN, defaultValue: false },
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'sub_tasks', underscored: true });
};
