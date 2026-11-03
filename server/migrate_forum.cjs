// Diễn đàn: tạo các bảng forum_categories / forum_threads / forum_posts / forum_post_likes và các chuyên mục mặc định.
// Chạy: node migrate_forum.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');
const statements = require('./scripts/forumSchema');

(async () => {
  try {
    for (const sql of statements) await sequelize.query(sql);
    console.log('✅ Diễn đàn sẵn sàng (bảng diễn đàn + chuyên mục mặc định)');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
