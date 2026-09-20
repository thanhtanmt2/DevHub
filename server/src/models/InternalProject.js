module.exports = (sequelize, DataTypes) => {
  return sequelize.define('InternalProject', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    job_post_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    budget: { type: DataTypes.DECIMAL(15, 2) },
    start_date: { type: DataTypes.DATEONLY },
    expected_end_date: { type: DataTypes.DATEONLY },
    actual_end_date: { type: DataTypes.DATEONLY },
    status: { type: DataTypes.ENUM('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), defaultValue: 'PLANNING' },
    completion_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  }, { tableName: 'internal_projects', underscored: true });
};
