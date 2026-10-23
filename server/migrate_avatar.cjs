// Ảnh đại diện cho mọi loại tài khoản (Ứng viên, Nhà tuyển dụng, Admin): thêm cột users.avatar_url
// và lấy ảnh đã có trong hồ sơ ứng viên (nếu có) làm ảnh của tài khoản.
// Chạy: node migrate_avatar.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');

async function run() {
  try {
    await sequelize.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)`);
    await sequelize.query(`
      UPDATE users u
      SET avatar_url = cp.avatar_url
      FROM candidate_profiles cp
      WHERE cp.user_id = u.id AND u.avatar_url IS NULL AND cp.avatar_url IS NOT NULL AND cp.avatar_url <> ''
    `);
    // Nhà tuyển dụng: ảnh đại diện và logo công ty là một → bổ sung cho bên còn trống
    await sequelize.query(`
      UPDATE companies c SET logo_url = u.avatar_url
      FROM users u
      WHERE u.id = c.user_id AND (c.logo_url IS NULL OR c.logo_url = '') AND u.avatar_url IS NOT NULL AND u.avatar_url <> ''
    `);
    await sequelize.query(`
      UPDATE users u SET avatar_url = c.logo_url
      FROM companies c
      WHERE c.user_id = u.id AND u.avatar_url IS NULL AND c.logo_url IS NOT NULL AND c.logo_url <> ''
    `);
    console.log('✅ users.avatar_url sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
