module.exports = (sequelize, DataTypes) => {
  return sequelize.define('RolePermission', {
    role_id: { type: DataTypes.UUID, primaryKey: true },
    permission_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'role_permissions', underscored: true, timestamps: false });
};
