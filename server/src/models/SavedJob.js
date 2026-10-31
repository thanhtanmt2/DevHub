// Tin tuyển dụng / vị trí dự án thời vụ mà ứng viên đã lưu (yêu thích). Mỗi dòng trỏ tới đúng một trong hai: job_post_id hoặc project_job_id.
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SavedJob', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_profile_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'candidate_profiles', key: 'id' }, onDelete: 'CASCADE' },
    job_post_id: { type: DataTypes.UUID, references: { model: 'job_posts', key: 'id' }, onDelete: 'CASCADE' },
    project_job_id: { type: DataTypes.UUID, references: { model: 'project_jobs', key: 'id' }, onDelete: 'CASCADE' },
  }, {
    tableName: 'saved_jobs',
    underscored: true,
    updatedAt: false,
    indexes: [
      { name: 'uq_saved_jobs_candidate_job', unique: true, fields: ['candidate_profile_id', 'job_post_id'] },
      { name: 'uq_saved_jobs_candidate_project_job', unique: true, fields: ['candidate_profile_id', 'project_job_id'] },
      { name: 'idx_saved_jobs_candidate', fields: ['candidate_profile_id'] },
    ],
  });
};
