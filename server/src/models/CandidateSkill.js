module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CandidateSkill', {
    candidate_profile_id: { type: DataTypes.UUID, primaryKey: true },
    skill_id: { type: DataTypes.UUID, primaryKey: true },
    level: { type: DataTypes.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'), defaultValue: 'BEGINNER' },
    years_of_experience: { type: DataTypes.DECIMAL(4, 1), defaultValue: 0, validate: { min: 0 } },
  }, { tableName: 'candidate_skills', underscored: true, timestamps: false });
};
