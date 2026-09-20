module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'LOCKED', 'INACTIVE'), defaultValue: 'INACTIVE' },
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    email_verify_token: { type: DataTypes.STRING(255) },
    reset_password_token: { type: DataTypes.STRING(255) },
    reset_password_expires: { type: DataTypes.DATE },
    refresh_token: { type: DataTypes.TEXT },
  }, { tableName: 'users', underscored: true });
};
