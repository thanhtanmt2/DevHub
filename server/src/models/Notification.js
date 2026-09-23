// Notification model
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false }, // recipient
    type: { 
      type: DataTypes.ENUM(
        'TASK_ASSIGNED', 'TASK_STATUS_CHANGED', 'TASK_APPROVED', 'TASK_REVISION',
        'TASK_COMMENT', 'TASK_DEADLINE_SOON', 'MEMBER_ADDED', 'MEMBER_ROLE_CHANGED',
        'PROJECT_UPDATE', 'INTERVIEW_SCHEDULED', 'APPLICATION_STATUS'
      ),
      allowNull: false 
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT },
    link: { type: DataTypes.STRING(500) }, // frontend URL to navigate to
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
  }, { tableName: 'notifications', underscored: true, updatedAt: false });
};
