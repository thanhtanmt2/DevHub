// Loại thông báo chuyển từ ENUM sang chuỗi để thêm loại mới (hồ sơ ứng tuyển, duyệt tin, xác thực doanh nghiệp, thanh toán...)
// mà không phải sửa database mỗi lần. Chạy: node migrate_notification_types.cjs (an toàn khi chạy lại, không mất dữ liệu)
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(40) USING type::text`);
    console.log('✅ notifications.type đã là VARCHAR(40)');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
