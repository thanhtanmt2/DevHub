// TaskComment: discussions inside a task
// - workspace_member_id: có giá trị khi người viết là thành viên Workspace; để trống khi là Admin (Admin không phải thành viên)
// - user_id: tài khoản người viết (luôn có với bình luận mới) để hiển thị đúng tên, kể cả Admin
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskComment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    workspace_member_id: { type: DataTypes.UUID, allowNull: true },
    user_id: { type: DataTypes.UUID, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'task_comments', underscored: true });
};
