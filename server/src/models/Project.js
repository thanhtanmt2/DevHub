module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Project', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    budget: { type: DataTypes.DECIMAL(15, 2) },
    start_date: { type: DataTypes.DATEONLY },
    expected_end_date: { type: DataTypes.DATEONLY },
    actual_end_date: { type: DataTypes.DATEONLY },
    status: { 
      type: DataTypes.ENUM('PLANNING', 'RECRUITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'), 
      defaultValue: 'PLANNING' 
    },
    completion_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    created_by_user_id: { type: DataTypes.UUID },
    manager_id: { type: DataTypes.UUID },
  }, { tableName: 'projects', underscored: true });
};
