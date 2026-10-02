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

