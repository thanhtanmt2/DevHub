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

