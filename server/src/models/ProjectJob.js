module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectJob', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    budget: { type: DataTypes.DECIMAL(15, 2) },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    deadline: { type: DataTypes.DATE },
    status: { type: DataTypes.ENUM('OPEN', 'CLOSED'), defaultValue: 'OPEN' },
  }, { tableName: 'project_jobs', underscored: true });
};
