// Hạn dùng của link xác thực email (24 giờ): thêm cột users.email_verify_expires.
// Dòng cũ để NULL = link cũ vẫn dùng được (không bị khóa đột ngột), link mới luôn có hạn.
// Chạy: node migrate_email_verify_expiry.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verify_expires TIMESTAMPTZ`);
    console.log('✅ users.email_verify_expires sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
