// Cột tùy chỉnh của bảng Kanban trong Workspace (Admin / Lead thêm). Chạy lại được nhiều lần (IF NOT EXISTS).
//  - workspace_columns: cột thêm, luôn nằm trong luồng "Đang làm" (giữ nguyên quy trình nộp sản phẩm, nghiệm thu, thanh toán)
//  - tasks.column_id: cột tùy chỉnh mà task đang đứng (NULL = cột mặc định theo trạng thái); xóa cột thì task về "Đang làm"
module.exports = [
  `CREATE TABLE IF NOT EXISTS workspace_columns (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(40) NOT NULL,
    color VARCHAR(12) NOT NULL DEFAULT 'blue',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_workspace_columns_ws ON workspace_columns (workspace_id, position)`,
  `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS column_id UUID REFERENCES workspace_columns(id) ON DELETE SET NULL`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_column ON tasks (column_id)`,
];
