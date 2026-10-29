// Mỗi dòng là một phiên đăng nhập trên một thiết bị. Chỉ lưu bản băm SHA-256 của refresh token (không lưu token gốc),
// nên một tài khoản đăng nhập được trên nhiều thiết bị cùng lúc và đăng xuất ở máy này không ảnh hưởng máy khác.
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('RefreshToken', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    user_agent: { type: DataTypes.STRING(255) },
    expires_at: { type: DataTypes.DATE, allowNull: false },
  }, {
    tableName: 'refresh_tokens',
    underscored: true,
    updatedAt: false,
    indexes: [{ name: 'idx_refresh_tokens_user', fields: ['user_id'] }],
  });
};
