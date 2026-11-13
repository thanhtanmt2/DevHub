// Cảm xúc thả vào một tin nhắn riêng (mỗi người một cảm xúc cho mỗi tin; thả lại thì đổi cảm xúc)
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ForumMessageReaction', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    message_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'forum_messages', key: 'id' }, onDelete: 'CASCADE' },
    user_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
    reaction: { type: DataTypes.STRING(12), allowNull: false },
  }, {
    tableName: 'forum_message_reactions',
    underscored: true,
    indexes: [{ unique: true, fields: ['message_id', 'user_id'] }, { fields: ['message_id'] }],
  });
};
