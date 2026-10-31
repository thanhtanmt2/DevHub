// Cài đặt tài khoản: thông tin cá nhân (users.phone / date_of_birth / gender / address), xác minh 2 bước (users.two_factor_enabled)
// và quyền riêng tư của ứng viên (candidate_profiles.is_searchable: cho phép nhà tuyển dụng tìm thấy hồ sơ).
// Chạy: node migrate_account_settings.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255)`);
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE`);
    await sequelize.query(`ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS is_searchable BOOLEAN NOT NULL DEFAULT TRUE`);
    console.log('✅ users (phone, date_of_birth, gender, address, two_factor_enabled) và candidate_profiles.is_searchable sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
