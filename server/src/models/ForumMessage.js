// Tin nhắn riêng giữa hai thành viên
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sender_id: { type: DataTypes.UUID, allowNull: false },
    recipient_id: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    read_at: { type: DataTypes.DATE },
  }, { tableName: 'forum_messages', underscored: true, updatedAt: false });
};
