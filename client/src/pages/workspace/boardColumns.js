// Cột của bảng Kanban trong Workspace: 4 cột mặc định (theo trạng thái) + các cột tùy chỉnh do Admin / Lead thêm.
// Cột tùy chỉnh luôn thuộc luồng "Đang làm" (task trong đó vẫn tính là đang làm), nằm giữa "Đang làm" và "Chờ duyệt".
export const MAX_CUSTOM_COLUMNS = 6; // khớp với backend (workspaceColumnController)

// Màu của cột tùy chỉnh: bám bảng màu của trang (xanh thương hiệu + màu trạng thái)
export const COLUMN_COLORS = {
  blue:    { name: 'Xanh dương', color: 'bg-primary-50', dot: 'bg-primary-500', text: 'text-primary-700' },
  emerald: { name: 'Xanh lá',    color: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  amber:   { name: 'Vàng',       color: 'bg-amber-50',   dot: 'bg-amber-500',   text: 'text-amber-700' },
  orange:  { name: 'Cam',        color: 'bg-orange-50',  dot: 'bg-orange-500',  text: 'text-orange-700' },
  red:     { name: 'Đỏ',         color: 'bg-red-50',     dot: 'bg-red-500',     text: 'text-red-700' },
  slate:   { name: 'Xám',        color: 'bg-slate-100',  dot: 'bg-slate-500',   text: 'text-slate-700' },
};
export const COLUMN_COLOR_KEYS = Object.keys(COLUMN_COLORS);

// Ghép 4 cột mặc định với các cột tùy chỉnh thành danh sách cột của bảng.
// key = mã vùng thả (droppableId): trạng thái với cột mặc định, "col:<id>" với cột tùy chỉnh
export function buildBoardColumns(statusMeta, custom = []) {
  const base = (status) => ({ key: status, status, columnId: null, custom: false, ...statusMeta[status] });
  return [
    base('TODO'),
    base('IN_PROGRESS'),
    ...custom.map((c) => ({
      key: `col:${c.id}`, status: 'IN_PROGRESS', columnId: c.id, custom: true, label: c.name, ...(COLUMN_COLORS[c.color] || COLUMN_COLORS.blue),
    })),
    base('REVIEW'),
    base('DONE'),
  ];
}
