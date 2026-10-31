const DEFAULT_PRIVACY_SETTINGS = {
  is_searchable: true,
  show_email: true,
  show_phone: true,
  show_address: true,
  show_links: true,
  show_introduction: true,
  show_cv: true,
  show_experiences: true,
  show_devhub_projects: true,
};

module.exports = (sequelize, DataTypes) => {
  const CandidateProfile = sequelize.define('CandidateProfile', {
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
    competency_score: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0, validate: { min: 0, max: 10 } },
    privacy_settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: DEFAULT_PRIVACY_SETTINGS,
    },
  }, { tableName: 'candidate_profiles', underscored: true });

  CandidateProfile.DEFAULT_PRIVACY_SETTINGS = DEFAULT_PRIVACY_SETTINGS;
  return CandidateProfile;
};
