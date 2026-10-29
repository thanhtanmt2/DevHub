module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    avatar_url: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('ACTIVE', 'LOCKED', 'INACTIVE'), defaultValue: 'INACTIVE' },
    email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    email_verify_token: { type: DataTypes.STRING(255) },
    email_verify_expires: { type: DataTypes.DATE }, // hạn dùng link xác thực (24 giờ); NULL = link cũ chưa có hạn
    reset_password_token: { type: DataTypes.STRING(255) },
    reset_password_expires: { type: DataTypes.DATE },
    refresh_token: { type: DataTypes.TEXT }, // không còn dùng: các phiên đăng nhập nằm ở bảng refresh_tokens
  }, { tableName: 'users', underscored: true });
};
