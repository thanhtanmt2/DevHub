// Báo cáo bài viết vi phạm gửi quản trị viên
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumReport', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    post_id: { type: DataTypes.UUID, allowNull: false },
    reporter_id: { type: DataTypes.UUID, allowNull: false },
    reason: { type: DataTypes.STRING(20), allowNull: false }, // SPAM | OFFENSIVE | ILLEGAL | OTHER
    note: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'OPEN' }, // OPEN | RESOLVED | DISMISSED
    handled_by: { type: DataTypes.UUID },
    handled_at: { type: DataTypes.DATE },
    action: { type: DataTypes.STRING(40) }, // hình thức xử lý: warn | delete | lock, nối bằng dấu +
  }, { tableName: 'forum_reports', underscored: true, updatedAt: false });
};
