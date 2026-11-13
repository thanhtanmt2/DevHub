// Tin nhắn riêng giữa hai thành viên
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    sender_id: { type: DataTypes.UUID, allowNull: false },
    recipient_id: { type: DataTypes.UUID, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    read_at: { type: DataTypes.DATE },
    reply_to_id: { type: DataTypes.UUID, references: { model: 'forum_messages', key: 'id' }, onDelete: 'SET NULL' }, // tin đang được trả lời
    recalled_at: { type: DataTypes.DATE }, // người gửi đã thu hồi (nội dung bị xóa)
    hidden_for_sender: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // người gửi đã "xóa ở phía tôi"
    hidden_for_recipient: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // người nhận đã "xóa ở phía tôi"
    pinned_at: { type: DataTypes.DATE }, // tin đang được ghim trong cuộc trò chuyện
    pinned_by: { type: DataTypes.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
  }, { tableName: 'forum_messages', underscored: true, updatedAt: false });
};
