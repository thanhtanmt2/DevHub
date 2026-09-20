module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Application', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    job_post_id: { type: DataTypes.UUID, allowNull: false },
    cover_letter: { type: DataTypes.TEXT },
    cv_url: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.ENUM('PENDING', 'VIEWED', 'INTERVIEW', 'HIRED', 'REJECTED'), defaultValue: 'PENDING' },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'applications', underscored: true, updatedAt: 'updated_at', createdAt: 'applied_at' });
};
