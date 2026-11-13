// Chủ đề diễn đàn: thuộc một chuyên mục (diễn đàn chung) HOẶC một workspace (diễn đàn riêng của dự án)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumThread', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    category_id: { type: DataTypes.UUID },
    workspace_id: { type: DataTypes.UUID },
    author_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    is_pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_locked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    view_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    reply_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    last_post_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    last_post_user_id: { type: DataTypes.UUID },
  }, { tableName: 'forum_threads', underscored: true });
};
