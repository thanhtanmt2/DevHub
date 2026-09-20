module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ApplicationStatusHistory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    application_id: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false },
    note: { type: DataTypes.TEXT },
    changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'application_status_history', underscored: true, timestamps: false });
};
