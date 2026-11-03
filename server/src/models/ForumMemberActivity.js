// Lần cuối thành viên hoạt động ở diễn đàn và chủ đề đang xem
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumMemberActivity', {
    user_id: { type: DataTypes.UUID, primaryKey: true },
    last_seen_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    thread_id: { type: DataTypes.UUID },
  }, { tableName: 'forum_member_activity', underscored: true, timestamps: false });
};
