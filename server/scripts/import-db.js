require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

const psqlPath = fs.existsSync('D:\\PostgreSQL\\bin\\psql.exe') 
  ? '"D:\\PostgreSQL\\bin\\psql.exe"' 
  : 'psql';

const backupFile = path.join(__dirname, '..', 'database_dump.sql');

if (!fs.existsSync(backupFile)) {
  console.error('❌ Không tìm thấy file database_dump.sql. Hãy chắc chắn bạn đã kéo code mới nhất từ Github về.');
  process.exit(1);
}

try {
  console.log('Đang nạp dữ liệu từ file vào Database...');
  // Chạy lệnh psql để nạp file
  execSync(`set PGPASSWORD=${DB_PASSWORD}&& ${psqlPath} -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f "${backupFile}" -q`, { stdio: 'inherit' });
  console.log(`\n✅ Nạp dữ liệu thành công! Bây giờ Database của bạn đã đồng bộ y hệt bản gốc.`);
} catch (error) {
  console.error('❌ Lỗi khi nạp dữ liệu:', error.message);
}
