const { Op } = require('sequelize');
const { sequelize, Workspace, WorkspaceColumn, Task } = require('../models');
const AppError = require('../utils/AppError');
const { getWorkspaceAccess } = require('../utils/workspaceAccess');

// Tùy chỉnh bảng Kanban của Workspace: thêm / đổi tên / đổi màu / sắp xếp / xóa cột, và đổi tên Workspace.
// Chỉ Admin hoặc Lead. Cột tùy chỉnh luôn thuộc luồng "Đang làm" nên nộp sản phẩm, nghiệm thu và thanh toán không bị ảnh hưởng.

const MAX_COLUMNS = 6;
const COLORS = ['blue', 'emerald', 'amber', 'orange', 'red', 'slate']; // khớp client (boardColumns.js)
const RESERVED = ['cần làm', 'đang làm', 'chờ duyệt', 'hoàn thành']; // trùng tên 4 cột mặc định gây nhầm
const isUuid = (v) => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);

async function requireManage(req) {
  const access = await getWorkspaceAccess(req, req.params.id);
  if (!access.canManageTasks) throw new AppError('Chỉ Admin hoặc Lead mới được tùy chỉnh Workspace', 403);
  return access;
}

const cleanName = (v, min, max, label) => {
  const name = String(v ?? '').replace(/\s+/g, ' ').trim();
  if (name.length < min || name.length > max) throw new AppError(`${label} từ ${min} đến ${max} ký tự`, 400);
  return name;
};

async function assertUniqueName(workspaceId, name, exceptId = null) {
  if (RESERVED.includes(name.toLowerCase())) throw new AppError('Tên này trùng với cột mặc định, hãy đặt tên khác', 400);
  const where = { workspace_id: workspaceId, ...(exceptId ? { id: { [Op.ne]: exceptId } } : {}) };
  const others = await WorkspaceColumn.findAll({ where, attributes: ['name'] });
  if (others.some((c) => c.name.toLowerCase() === name.toLowerCase())) throw new AppError('Đã có cột trùng tên', 400);
}

async function loadColumn(req) {
  const col = isUuid(req.params.columnId) ? await WorkspaceColumn.findOne({ where: { id: req.params.columnId, workspace_id: req.params.id } }) : null;
  if (!col) throw new AppError('Không tìm thấy cột', 404);
  return col;
}

const listColumns = (workspaceId) => WorkspaceColumn.findAll({ where: { workspace_id: workspaceId }, order: [['position', 'ASC'], ['created_at', 'ASC']] });

// POST /api/workspaces/:id/columns { name, color }
exports.createColumn = async (req, res, next) => {
  try {
    await requireManage(req);
    const name = cleanName(req.body.name, 2, 40, 'Tên cột');
    const color = COLORS.includes(req.body.color) ? req.body.color : 'blue';
    if (await WorkspaceColumn.count({ where: { workspace_id: req.params.id } }) >= MAX_COLUMNS) throw new AppError(`Mỗi Workspace tối đa ${MAX_COLUMNS} cột thêm`, 400);
    await assertUniqueName(req.params.id, name);
    const max = await WorkspaceColumn.max('position', { where: { workspace_id: req.params.id } });
    const column = await WorkspaceColumn.create({ workspace_id: req.params.id, name, color, position: (max ?? -1) + 1 });
    res.status(201).json({ success: true, data: column, message: `Đã thêm cột "${name}"` });
  } catch (error) { next(error); }
};

// PUT /api/workspaces/:id/columns/:columnId { name?, color? }
exports.updateColumn = async (req, res, next) => {
  try {
    await requireManage(req);
    const col = await loadColumn(req);
    const patch = {};
    if (req.body.name !== undefined) { patch.name = cleanName(req.body.name, 2, 40, 'Tên cột'); await assertUniqueName(req.params.id, patch.name, col.id); }
    if (req.body.color !== undefined) { if (!COLORS.includes(req.body.color)) throw new AppError('Màu không hợp lệ', 400); patch.color = req.body.color; }
    await col.update(patch);
    res.json({ success: true, data: col, message: 'Đã cập nhật cột' });
  } catch (error) { next(error); }
};

// PUT /api/workspaces/:id/columns-order { ids: [columnId, ...] } — thứ tự mới của các cột thêm
exports.reorderColumns = async (req, res, next) => {
  try {
    await requireManage(req);
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const cols = await listColumns(req.params.id);
    if (ids.length !== cols.length || !cols.every((c) => ids.includes(c.id))) throw new AppError('Danh sách cột không khớp', 400);
    await sequelize.transaction(async (transaction) => {
      await Promise.all(ids.map((id, i) => WorkspaceColumn.update({ position: i }, { where: { id, workspace_id: req.params.id }, transaction })));
    });
    res.json({ success: true, data: await listColumns(req.params.id), message: 'Đã sắp xếp lại các cột' });
  } catch (error) { next(error); }
};

// DELETE /api/workspaces/:id/columns/:columnId — task trong cột quay về "Đang làm"
exports.deleteColumn = async (req, res, next) => {
  try {
    await requireManage(req);
    const col = await loadColumn(req);
    const moved = await Task.count({ where: { column_id: col.id } });
    await col.destroy(); // tasks.column_id tự về NULL (ON DELETE SET NULL)
    res.json({ success: true, data: { moved_tasks: moved }, message: moved ? `Đã xóa cột "${col.name}", ${moved} task quay về "Đang làm"` : `Đã xóa cột "${col.name}"` });
  } catch (error) { next(error); }
};

// PUT /api/workspaces/:id { name } — đổi tên Workspace
exports.updateWorkspace = async (req, res, next) => {
  try {
    const { workspace } = await requireManage(req);
    const name = cleanName(req.body.name, 3, 120, 'Tên Workspace');
    await Workspace.update({ name }, { where: { id: workspace.id } });
    res.json({ success: true, data: { id: workspace.id, name }, message: 'Đã đổi tên Workspace' });
  } catch (error) { next(error); }
};
