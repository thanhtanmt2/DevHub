module.exports = (sequelize, DataTypes) => {
  return sequelize.define('JobPostSkill', {
    job_post_id: { type: DataTypes.UUID, primaryKey: true },
    skill_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'job_post_skills', underscored: true, timestamps: false });
};
