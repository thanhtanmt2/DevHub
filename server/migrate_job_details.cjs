// Bổ sung thông tin chi tiết cho tin tuyển dụng (giống các trang tuyển dụng):
// yêu cầu ứng viên, quyền lợi, kinh nghiệm, cấp bậc, địa chỉ & thời gian làm việc.
// Chạy: node migrate_job_details.cjs   (an toàn khi chạy lại nhiều lần, chỉ THÊM cột, không xóa dữ liệu)
const { sequelize } = require('./src/models');

const STATEMENTS = [
  // Việc làm tại doanh nghiệp
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS requirements TEXT`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS benefits TEXT`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS experience VARCHAR(20)`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS position_level VARCHAR(20)`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS work_address VARCHAR(500)`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS working_time VARCHAR(255)`,
  // Dự án thời vụ
  `ALTER TABLE project_jobs ADD COLUMN IF NOT EXISTS requirements TEXT`,
  `ALTER TABLE project_jobs ADD COLUMN IF NOT EXISTS benefits TEXT`,
  `ALTER TABLE project_jobs ADD COLUMN IF NOT EXISTS experience VARCHAR(20)`,
];

async function run() {
  try {
    for (const sql of STATEMENTS) await sequelize.query(sql);
    console.log('✅ job_posts và project_jobs đã có các cột thông tin chi tiết');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
