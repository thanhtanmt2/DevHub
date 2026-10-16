// Bỏ vai trò "Quản lý dự án" (MANAGER) và "Người xem" (VIEWER): Admin là chủ, Admin cử Lead để chia việc.
// - Người đang là MANAGER  → chuyển thành LEAD  (giữ nguyên khả năng tạo/giao việc và nghiệm thu)
// - Người đang là VIEWER   → chuyển thành MEMBER
// - Xóa gán "Quản lý dự án" trong bảng projects (cột manager_id không còn dùng; không xóa cột để an toàn)
// Chạy: node migrate_remove_manager_viewer.cjs   (an toàn khi chạy lại nhiều lần)
const { sequelize } = require('./src/models');

async function run() {
  try {
    const [, m] = await sequelize.query(`UPDATE workspace_members SET role = 'LEAD' WHERE role = 'MANAGER';`);
    const [, v] = await sequelize.query(`UPDATE workspace_members SET role = 'MEMBER' WHERE role = 'VIEWER';`);
    const hasCol = await sequelize.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'manager_id'`,
      { type: sequelize.QueryTypes.SELECT }
    );
    if (hasCol.length) await sequelize.query(`UPDATE projects SET manager_id = NULL WHERE manager_id IS NOT NULL;`);
    console.log(`✅ Đã chuyển ${m.rowCount ?? 0} Quản lý dự án → Lead, ${v.rowCount ?? 0} người Xem → Thành viên`);
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
