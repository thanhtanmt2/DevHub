require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

// Tự động tìm đường dẫn pg_dump trên Windows hoặc dùng biến môi trường mặc định
const pgDumpPath = fs.existsSync('D:\\PostgreSQL\\bin\\pg_dump.exe') 
  ? '"D:\\PostgreSQL\\bin\\pg_dump.exe"' 
  : 'pg_dump';

const backupFile = path.join(__dirname, '..', 'database_dump.sql');

try {
  console.log('Đang xuất dữ liệu Database...');
  // Chạy lệnh pg_dump để xuất DB thành dạng câu lệnh INSERT để máy khác đọc được dễ dàng
  execSync(`set PGPASSWORD=${DB_PASSWORD}&& ${pgDumpPath} -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} --clean --if-exists --inserts -f "${backupFile}"`, { stdio: 'inherit' });
  console.log(`\n✅ Thành công! Toàn bộ dữ liệu hiện tại đã được lưu vào file: database_dump.sql`);
  console.log(`Bây giờ bạn có thể git add và push file này lên Github.`);
} catch (error) {
  console.error('❌ Lỗi khi xuất dữ liệu:', error.message);
}
