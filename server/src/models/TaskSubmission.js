module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskSubmission', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    task_id: { type: DataTypes.UUID, allowNull: false },
    product_url: { type: DataTypes.STRING(500) },
    attachment_url: { type: DataTypes.STRING(500) },
    note: { type: DataTypes.TEXT },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    review_status: { type: DataTypes.ENUM('PENDING_REVIEW', 'ACCEPTED', 'REVISION_REQUIRED'), defaultValue: 'PENDING_REVIEW' },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'task_submissions', underscored: true, timestamps: false });
};
