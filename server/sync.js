require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');
    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ tất cả các bảng thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
})();
