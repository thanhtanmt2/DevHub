// Bài viết được lưu
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumBookmark', {
    user_id: { type: DataTypes.UUID, primaryKey: true },
    post_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'forum_bookmarks', underscored: true, updatedAt: false });
};
