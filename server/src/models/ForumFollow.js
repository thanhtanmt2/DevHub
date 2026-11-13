// Theo dõi thành viên: được báo khi họ mở chủ đề mới
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumFollow', {
    follower_id: { type: DataTypes.UUID, primaryKey: true },
    followee_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'forum_follows', underscored: true, updatedAt: false });
};
