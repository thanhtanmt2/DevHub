module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Experience', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    job_title: { type: DataTypes.STRING(150), allowNull: false },
    company_name: { type: DataTypes.STRING(200), allowNull: false },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    description: { type: DataTypes.TEXT },
  }, { tableName: 'experiences', underscored: true });
};
