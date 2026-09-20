module.exports = (sequelize, DataTypes) => {
  return sequelize.define('UserRole', {
    user_id: { type: DataTypes.UUID, primaryKey: true },
    role_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'user_roles', underscored: true, timestamps: false });
};
