module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CandidateProfile', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    professional_title: { type: DataTypes.STRING(150) },
    introduction: { type: DataTypes.TEXT },
    phone: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.STRING(255) },
    github_url: { type: DataTypes.STRING(500) },
    portfolio_url: { type: DataTypes.STRING(500) },
    avatar_url: { type: DataTypes.STRING(500) },
    cv_url: { type: DataTypes.STRING(500) },
    cv_name: { type: DataTypes.STRING(255) },
    is_searchable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }, // false: không hiện trong mục Tìm ứng viên của nhà tuyển dụng
    competency_score: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0, validate: { min: 0, max: 10 } },
  }, { tableName: 'candidate_profiles', underscored: true });
};
