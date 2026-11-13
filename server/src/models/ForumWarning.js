// Cảnh cáo một thành viên vi phạm nội quy diễn đàn (kèm trích đoạn bài vi phạm để còn bằng chứng khi bài đã bị xóa)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumWarning', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    issued_by: { type: DataTypes.UUID },
    post_id: { type: DataTypes.UUID },
    reason: { type: DataTypes.STRING(20) },
    message: { type: DataTypes.STRING(500), allowNull: false },
    post_excerpt: { type: DataTypes.STRING(300) },
    thread_title: { type: DataTypes.STRING(200) },
    post_deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, { tableName: 'forum_warnings', underscored: true, updatedAt: false });
};
