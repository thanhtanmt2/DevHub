// Cột tùy chỉnh của bảng Kanban trong một Workspace (Admin / Lead thêm); luôn thuộc luồng "Đang làm"
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('WorkspaceColumn', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    workspace_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(40), allowNull: false },
    color: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'blue' },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, { tableName: 'workspace_columns', underscored: true });
};
