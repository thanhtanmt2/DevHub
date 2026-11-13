// Cột tùy chỉnh của bảng Kanban: tạo bảng workspace_columns và cột tasks.column_id.
// Chạy: node migrate_workspace_columns.cjs   (an toàn khi chạy lại nhiều lần, không xóa dữ liệu)
const { sequelize } = require('./src/models');
const statements = require('./scripts/workspaceColumnSchema');

(async () => {
  try {
    for (const sql of statements) await sequelize.query(sql);
    console.log('✅ Cột tùy chỉnh của Workspace sẵn sàng');
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
