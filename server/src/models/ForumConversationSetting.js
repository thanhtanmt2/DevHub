// Cài đặt riêng của một người cho một cuộc trò chuyện (ghim hội thoại lên đầu danh sách)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumConversationSetting', {
    user_id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    peer_id: { type: DataTypes.UUID, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    pinned_at: { type: DataTypes.DATE },
  }, { tableName: 'forum_conversation_settings', underscored: true });
};
