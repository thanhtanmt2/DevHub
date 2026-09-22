module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Workspace', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'CLOSED', 'ARCHIVED'), defaultValue: 'ACTIVE' },
  }, { tableName: 'workspaces', underscored: true });
};
