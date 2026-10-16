const { Op } = require('sequelize');
const { Task, Workspace, Project } = require('../models');

// Tiến độ dự án = trung bình % hoàn thành của các task chưa hủy trong Workspace.
// Cùng công thức với thanh tiến độ ở trang Workspace và tab Thống kê.
// Hàm này không bao giờ throw: lỗi cập nhật tiến độ không được làm hỏng thao tác chính.
async function syncProjectProgress(workspaceId) {
  try {
    const workspace = await Workspace.findByPk(workspaceId, { attributes: ['id', 'project_id'] });
    if (!workspace) return null;
    const tasks = await Task.findAll({
      where: { workspace_id: workspaceId, status: { [Op.ne]: 'CANCELLED' } },
      attributes: ['completion_rate'],
      raw: true,
    });
    const rate = tasks.length
      ? Math.round(tasks.reduce((sum, t) => sum + (t.completion_rate || 0), 0) / tasks.length)
      : 0;
    await Project.update({ completion_rate: rate }, { where: { id: workspace.project_id } });
    return rate;
  } catch (error) {
    console.error('[ProjectProgress] Error:', error.message);
    return null;
  }
}

// Đồng bộ một lần cho các Workspace đã có task (dữ liệu cũ chưa từng được cập nhật tiến độ).
// Workspace chưa có task thì giữ nguyên, không ghi đè.
async function backfillProjectProgress() {
  try {
    const rows = await Task.findAll({ attributes: ['workspace_id'], group: ['workspace_id'], raw: true });
    for (const { workspace_id } of rows) await syncProjectProgress(workspace_id);
  } catch (error) {
    console.error('[ProjectProgress] Backfill error:', error.message);
  }
}

module.exports = { syncProjectProgress, backfillProjectProgress };
