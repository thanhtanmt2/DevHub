// Cảm xúc của một người với một bài (mỗi người một cảm xúc cho mỗi bài): value = 1 là Thích, value = -1 là Không thích
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumPostLike', {
    post_id: { type: DataTypes.UUID, primaryKey: true },
    user_id: { type: DataTypes.UUID, primaryKey: true },
    value: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1, validate: { isIn: [[1, -1]] } },
  }, { tableName: 'forum_post_likes', underscored: true, updatedAt: false });
};
