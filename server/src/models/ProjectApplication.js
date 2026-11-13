module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectApplication', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    project_job_id: { type: DataTypes.UUID, allowNull: false },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false },
    cover_letter: { type: DataTypes.TEXT },
    cv_url: { type: DataTypes.STRING(500) },
    status: { 
      type: DataTypes.ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'INTERVIEW'), 
      defaultValue: 'PENDING' 
    },
    interview_time: { type: DataTypes.DATE },
    interview_duration: { type: DataTypes.INTEGER, defaultValue: 30 },
    interviewer_id: { type: DataTypes.UUID, allowNull: true },
    interviewer_name: { type: DataTypes.STRING(150) },
    interview_response: { type: DataTypes.STRING(30), defaultValue: 'PENDING' }, // PENDING | CONFIRMED | RESCHEDULE_REQUESTED
    candidate_reschedule_note: { type: DataTypes.TEXT },
    interview_responded_at: { type: DataTypes.DATE },
    meet_url: { type: DataTypes.STRING(500) },
    interview_note: { type: DataTypes.TEXT },
    interview_result: { type: DataTypes.STRING(30), allowNull: true }, // PASS | CONSIDER | REJECT
    interview_score: { type: DataTypes.DECIMAL(4, 2), allowNull: true },
    interview_criteria_scores: { type: DataTypes.JSONB, allowNull: true },
    interview_feedback: { type: DataTypes.TEXT, allowNull: true },
    interview_evaluated_at: { type: DataTypes.DATE, allowNull: true },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { 
    tableName: 'project_applications', 
    underscored: true, 
    updatedAt: 'updated_at',
    createdAt: 'applied_at',
    // 1 ứng viên chỉ ứng tuyển 1 lần vào 1 vị trí dự án
    indexes: [{ unique: true, name: 'uq_project_applications_candidate_job', fields: ['candidate_profile_id', 'project_job_id'] }],
  });
};
