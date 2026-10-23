// Notification model
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false }, // recipient
    // Loại thông báo (TASK_ASSIGNED, APPLICATION_SUBMITTED, JOB_APPROVED...). Client chọn icon theo loại này.
    type: { type: DataTypes.STRING(40), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT },
    link: { type: DataTypes.STRING(500) }, // frontend URL to navigate to
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    metadata: { type: DataTypes.JSONB, defaultValue: {} },
  }, { tableName: 'notifications', underscored: true, updatedAt: false });
};
