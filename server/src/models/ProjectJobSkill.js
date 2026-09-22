module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectJobSkill', {
    project_job_id: { type: DataTypes.UUID, primaryKey: true },
    skill_id: { type: DataTypes.UUID, primaryKey: true },
  }, { tableName: 'project_job_skills', underscored: true, timestamps: false });
};
