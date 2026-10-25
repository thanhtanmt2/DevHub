module.exports = (sequelize, DataTypes) => {
  return sequelize.define('CandidateSkill', {
    candidate_profile_id: { type: DataTypes.UUID, primaryKey: true },
    skill_id: { type: DataTypes.UUID, primaryKey: true },
    // Nguồn kỹ năng: MANUAL (ứng viên tự thêm), CV (lọc từ CV), PROJECT (từ dự án đã hoàn thành trên nền tảng)
    source: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'MANUAL', validate: { isIn: [['MANUAL', 'CV', 'PROJECT']] } },
  }, { tableName: 'candidate_skills', underscored: true, timestamps: false });
};
