// ActivityLog — ghi lại mọi hoạt động hệ thống
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ActivityLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

    // Ai thực hiện
    user_id: { type: DataTypes.UUID, allowNull: true }, // null = system
    user_name: { type: DataTypes.STRING(255) },         // snapshot tên lúc ghi log
    user_role: { type: DataTypes.STRING(50) },          // ADMIN, CANDIDATE, EMPLOYER

    // Hành động
    action: {
      type: DataTypes.ENUM(
        // Auth
        'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'PASSWORD_CHANGED', 'USER_STATUS_CHANGED',
        // Task
        'TASK_CREATED', 'TASK_UPDATED', 'TASK_STATUS_CHANGED', 'TASK_DELETED',
        'TASK_APPROVED', 'TASK_REVISION_REQUESTED', 'TASK_COMMENTED', 'SUBTASK_ADDED', 'SUBTASK_TOGGLED',
        // Workspace / Member
        'WORKSPACE_MEMBER_ADDED', 'WORKSPACE_MEMBER_REMOVED', 'WORKSPACE_MEMBER_ROLE_CHANGED',
        // Project
        'PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_MANAGER_ASSIGNED', 'PROJECT_CLOSED',
        // Application
        'APPLICATION_SUBMITTED', 'APPLICATION_STATUS_CHANGED', 'INTERVIEW_SCHEDULED',
        // Payment
        'PAYMENT_CREATED', 'PAYMENT_PROCESSED',
        // Evaluation
        'MEMBER_EVALUATED'
      ),
      allowNull: false
    },

    // Ngữ cảnh
    entity_type: { type: DataTypes.STRING(50) },   // task, workspace, project, user, application, payment, evaluation
    entity_id: { type: DataTypes.UUID },
    entity_name: { type: DataTypes.STRING(500) },  // snapshot tên entity

    // Thay đổi
    old_value: { type: DataTypes.TEXT },
    new_value: { type: DataTypes.TEXT },
    description: { type: DataTypes.TEXT },         // Mô tả đọc được bằng tiếng Việt

    // Metadata bổ sung (project_id, workspace_id để filter)
    metadata: { type: DataTypes.JSONB, defaultValue: {} },

    // Nguồn gốc
    ip_address: { type: DataTypes.STRING(50) },
    user_agent: { type: DataTypes.STRING(500) },
  }, {
    tableName: 'activity_logs',
    underscored: true,
    updatedAt: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['action'] },
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['created_at'] },
    ]
  });
};
