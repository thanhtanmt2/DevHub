module.exports = (sequelize, DataTypes) => {
  return sequelize.define('JobPost', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    created_by_user_id: { type: DataTypes.UUID, allowNull: false },
    company_id: { type: DataTypes.UUID },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    post_type: { type: DataTypes.ENUM('INTERNAL', 'PARTNER'), allowNull: false },
    work_type: { type: DataTypes.ENUM('FREELANCE', 'PART_TIME', 'REMOTE', 'FULL_TIME') },
    location: { type: DataTypes.STRING(255) },
    salary_min: { type: DataTypes.DECIMAL(15, 2) },
    salary_max: { type: DataTypes.DECIMAL(15, 2) },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    posted_at: { type: DataTypes.DATE },
    deadline: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('DRAFT', 'PENDING_APPROVAL', 'OPEN', 'HIDDEN', 'CLOSED'), defaultValue: 'DRAFT' },
    view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { tableName: 'job_posts', underscored: true });
};
