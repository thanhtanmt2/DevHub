// Tệp / liên kết tài liệu đính kèm vào task trong lúc làm việc (giống mục "Attachments" của Jira).
// Khác với TaskSubmission: đó là sản phẩm nộp để nghiệm thu, còn đây là tài liệu tham khảo, bản nháp, ảnh chụp...
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskAttachment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    kind: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'FILE' }, // FILE | LINK
    name: { type: DataTypes.STRING(255), allowNull: false },
    url: { type: DataTypes.STRING(1000), allowNull: false },
    size: { type: DataTypes.INTEGER },
    uploaded_by_user_id: { type: DataTypes.UUID },
    uploaded_by_name: { type: DataTypes.STRING(150) },
  }, { tableName: 'task_attachments', underscored: true, updatedAt: false });
};
