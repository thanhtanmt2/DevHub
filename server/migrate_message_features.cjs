// Tin nhắn kiểu Zalo: thêm cột (trả lời, thu hồi, xóa ở phía mình, ghim) và bảng cảm xúc, cài đặt hội thoại.
// Chạy: node migrate_message_features.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');
const statements = require('./scripts/messageSchema');

(async () => {
  try {
    for (const sql of statements) await sequelize.query(sql);
    console.log('✅ Tính năng tin nhắn kiểu Zalo sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
