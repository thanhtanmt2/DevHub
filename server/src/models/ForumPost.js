// Một bài trong chủ đề (bài đầu tiên là bài gốc). quote_post_id: bài được trích dẫn khi trả lời
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumPost', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    thread_id: { type: DataTypes.UUID, allowNull: false },
    author_id: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    quote_post_id: { type: DataTypes.UUID },
    edited_at: { type: DataTypes.DATE },
  }, { tableName: 'forum_posts', underscored: true });
};
