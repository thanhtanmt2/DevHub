require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

const psqlCandidates = [
  'D:\\PostgreSQL\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
  'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe',
];
const found = psqlCandidates.find(p => fs.existsSync(p));
const psqlPath = found ? `"${found}"` : 'psql';

const backupFile = path.join(__dirname, '..', 'database_dump.sql');

if (!fs.existsSync(backupFile)) {
  console.error('❌ Không tìm thấy file database_dump.sql. Hãy chắc chắn bạn đã kéo code mới nhất từ Github về.');
  process.exit(1);
}

try {
  console.log('Đang nạp dữ liệu từ file vào Database...');
  execSync(`set PGPASSWORD=${DB_PASSWORD}&& ${psqlPath} -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f "${backupFile}" -q`, { stdio: 'inherit' });
  console.log(`\n✅ Nạp dữ liệu thành công!`);
} catch (error) {
  console.error('❌ Lỗi khi nạp dữ liệu:', error.message);
  process.exit(1);
}

// ─── Migrate: patch các cột mới chưa có trong dump ───────────────────────────
const migrations = [
  // companies: xác thực email doanh nghiệp
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_email_verified BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_email_token VARCHAR(10)`,
  `ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_email_token_expires TIMESTAMPTZ`,
  // task_attachments: tệp / liên kết tài liệu đính kèm task
  `CREATE TABLE IF NOT EXISTS task_attachments (id UUID PRIMARY KEY, task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, kind VARCHAR(10) NOT NULL DEFAULT 'FILE', name VARCHAR(255) NOT NULL, url VARCHAR(1000) NOT NULL, size INTEGER, uploaded_by_user_id UUID, uploaded_by_name VARCHAR(150), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
  // notifications: loại thông báo là chuỗi để thêm loại mới
  `ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(40) USING type::text`,
  // users: ảnh đại diện (lấy từ hồ sơ ứng viên nếu có)
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)`,
  // job_posts / project_jobs: thông tin chi tiết tin tuyển dụng
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS requirements TEXT`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS benefits TEXT`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS experience VARCHAR(20)`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS position_level VARCHAR(20)`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS work_address VARCHAR(500)`,
  `ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS working_time VARCHAR(255)`,
  `ALTER TABLE project_jobs ADD COLUMN IF NOT EXISTS requirements TEXT`,
  `ALTER TABLE project_jobs ADD COLUMN IF NOT EXISTS benefits TEXT`,
  `ALTER TABLE project_jobs ADD COLUMN IF NOT EXISTS experience VARCHAR(20)`,
  // candidate_skills: nguồn kỹ năng (MANUAL | CV | PROJECT); experiences: sơ đồ kinh nghiệm (loại mục, dự án con, việc đã làm, công nghệ, link)
  `ALTER TABLE candidate_skills ADD COLUMN IF NOT EXISTS source VARCHAR(10) NOT NULL DEFAULT 'MANUAL'`,
  `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'COMPANY'`,
  `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES experiences(id) ON DELETE CASCADE`,
  `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS tasks JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS technologies JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS link_url VARCHAR(500)`,
  `CREATE INDEX IF NOT EXISTS idx_experiences_parent ON experiences(parent_id)`,
  // users: hạn dùng của link xác thực email (24 giờ)
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_expires TIMESTAMPTZ`,
  // refresh_tokens: đăng nhập nhiều thiết bị cùng lúc (chỉ lưu bản băm token). Phiên không đi theo file dump, nên xóa token cũ
  `CREATE TABLE IF NOT EXISTS refresh_tokens (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash VARCHAR(64) NOT NULL UNIQUE, user_agent VARCHAR(255), expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
  `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)`,
  `UPDATE users SET refresh_token = NULL WHERE refresh_token IS NOT NULL`,
  // chống trùng ở mức cơ sở dữ liệu (ứng tuyển, ứng tuyển dự án, thành viên Workspace)
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_applications_candidate_job ON applications (candidate_profile_id, job_post_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_project_applications_candidate_job ON project_applications (candidate_profile_id, project_job_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_workspace_members_workspace_candidate ON workspace_members (workspace_id, candidate_profile_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_workspace_member ON payments (workspace_member_id)`,
  `ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB NOT NULL DEFAULT '{"is_searchable":true,"show_email":true,"show_phone":true,"show_address":true,"show_links":true,"show_introduction":true,"show_cv":true,"show_experiences":true,"show_devhub_projects":true}'::jsonb`,
  `CREATE TABLE IF NOT EXISTS saved_candidates (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
  `CREATE UNIQUE INDEX IF NOT EXISTS uq_saved_candidates_user_profile ON saved_candidates (user_id, candidate_profile_id)`,
];

console.log('Đang chạy migration patch...');
const pgPath = psqlPath; // dùng lại psql đã tìm được ở trên
let migrationErrors = 0;
for (const sql of migrations) {
  try {
    execSync(`set PGPASSWORD=${DB_PASSWORD}&& ${pgPath} -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -c "${sql}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`  ⚠️  Migration lỗi: ${sql.substring(0, 60)}...`);
    migrationErrors++;
  }
}

if (migrationErrors === 0) {
  console.log('✅ Migration hoàn tất! Database đã sẵn sàng.\n');
} else {
  console.warn(`⚠️  ${migrationErrors} migration(s) thất bại. Kiểm tra lỗi ở trên.\n`);
}

