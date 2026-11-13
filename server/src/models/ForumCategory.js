// Chuyên mục của diễn đàn chung. admin_only: chỉ Admin được mở chủ đề (vd. Thông báo & Nội quy)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumCategory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
    icon: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'chat' },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    admin_only: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, { tableName: 'forum_categories', underscored: true });
};
