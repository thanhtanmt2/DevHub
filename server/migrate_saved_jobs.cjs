// Việc làm đã lưu (yêu thích): tạo bảng saved_jobs. Mỗi dòng là một tin tuyển dụng (job_post_id) HOẶC một vị trí dự án thời vụ
// (project_job_id); xóa tin / hồ sơ thì dòng lưu tự xóa theo (ON DELETE CASCADE).
// Chạy: node migrate_saved_jobs.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id UUID PRIMARY KEY,
        candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        job_post_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
        project_job_id UUID REFERENCES project_jobs(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_saved_jobs_one_target CHECK ((job_post_id IS NOT NULL)::int + (project_job_id IS NOT NULL)::int = 1)
      )
    `);
    await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_jobs_candidate_job ON saved_jobs(candidate_profile_id, job_post_id)`);
    await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_jobs_candidate_project_job ON saved_jobs(candidate_profile_id, project_job_id)`);
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_saved_jobs_candidate ON saved_jobs(candidate_profile_id)`);
    console.log('✅ Bảng saved_jobs sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
