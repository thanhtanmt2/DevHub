// Bỏ qua thành viên: ẩn bài viết của họ và không nhận tin nhắn từ họ
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumIgnore', {
    user_id: { type: DataTypes.UUID, primaryKey: true },
    ignored_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'forum_ignores', underscored: true, updatedAt: false });
};
