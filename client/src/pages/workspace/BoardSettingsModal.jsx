import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi } from '@/api/workspaceApi';
import Icon from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import { COLUMN_COLORS, COLUMN_COLOR_KEYS, MAX_CUSTOM_COLUMNS } from './boardColumns';

const apiError = (e, fallback) => e.response?.data?.message || fallback;

// Chọn màu cột (6 màu)
function Swatches({ value, onChange, size = 'w-5 h-5' }) {
  return (
    <span className="inline-flex items-center gap-1.5" role="radiogroup" aria-label="Màu cột">
      {COLUMN_COLOR_KEYS.map((k) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} aria-label={COLUMN_COLORS[k].name} title={COLUMN_COLORS[k].name} onClick={() => onChange(k)}
          className={`${size} rounded-full ${COLUMN_COLORS[k].dot} transition-transform ${value === k ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`} />
      ))}
    </span>
  );
}

// Một cột tùy chỉnh: đổi tên (Enter hoặc rời ô để lưu), đổi màu, sắp xếp, xóa
function ColumnRow({ col, index, total, count, onSave, onMove, onDelete, busy }) {
  const [name, setName] = useState(col.name);
  const commit = () => {
    const v = name.replace(/\s+/g, ' ').trim();
    if (v === col.name) return;
    if (v.length < 2) { setName(col.name); return; }
    onSave({ name: v });
  };
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${COLUMN_COLORS[col.color]?.dot || 'bg-primary-500'}`} />
      <input
        className="input-field !py-1.5 flex-1 min-w-[8rem]" value={name} maxLength={40} aria-label={`Tên cột ${col.name}`} disabled={busy}
        onChange={(e) => setName(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setName(col.name); }}
      />
      <Swatches value={col.color} onChange={(color) => color !== col.color && onSave({ color })} />
      <span className="text-xs text-gray-400 w-14 text-right">{count} task</span>
      <span className="inline-flex items-center">
        <button type="button" disabled={index === 0 || busy} onClick={() => onMove(-1)} aria-label="Dịch sang trái" title="Dịch sang trái" className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"><Icon name="chevronLeft" className="w-4 h-4" /></button>
        <button type="button" disabled={index === total - 1 || busy} onClick={() => onMove(1)} aria-label="Dịch sang phải" title="Dịch sang phải" className="w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center"><Icon name="chevronRight" className="w-4 h-4" /></button>
        <button type="button" disabled={busy} onClick={onDelete} aria-label={`Xóa cột ${col.name}`} title="Xóa cột" className="w-7 h-7 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center"><Icon name="trash" className="w-4 h-4" /></button>
      </span>
    </li>
  );
}

// Tùy chỉnh bảng (Admin / Lead): đổi tên Workspace, thêm / đổi tên / đổi màu / sắp xếp / xóa cột
export default function BoardSettingsModal({ workspace, columns, taskCounts = {}, onClose }) {
  useEscapeKey(onClose);
  const qc = useQueryClient();
  const confirm = useConfirm();
  const id = workspace.id;
  const [wsName, setWsName] = useState(workspace.name);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('blue');

  const refresh = () => { qc.invalidateQueries({ queryKey: ['workspace', id] }); qc.invalidateQueries({ queryKey: ['workspace-tasks', id] }); };
  const rename = useMutation({
    mutationFn: () => workspaceApi.updateWorkspace(id, { name: wsName }),
    onSuccess: (res) => { toast.success(res.data.message); setWsName(res.data.data.name); refresh(); },
    onError: (e) => toast.error(apiError(e, 'Chưa đổi được tên Workspace')),
  });
  const add = useMutation({
    mutationFn: () => workspaceApi.createColumn(id, { name: newName, color: newColor }),
    onSuccess: (res) => { toast.success(res.data.message); setNewName(''); refresh(); },
    onError: (e) => toast.error(apiError(e, 'Chưa thêm được cột')),
  });
  const save = useMutation({
    mutationFn: ({ columnId, patch }) => workspaceApi.updateColumn(id, columnId, patch),
    onSuccess: refresh,
    onError: (e) => { toast.error(apiError(e, 'Chưa cập nhật được cột')); refresh(); },
  });
  const reorder = useMutation({
    mutationFn: (ids) => workspaceApi.reorderColumns(id, ids),
    onSuccess: refresh,
    onError: (e) => toast.error(apiError(e, 'Chưa sắp xếp được')),
  });
  const remove = useMutation({
    mutationFn: (columnId) => workspaceApi.deleteColumn(id, columnId),
    onSuccess: (res) => { toast.success(res.data.message); refresh(); },
    onError: (e) => toast.error(apiError(e, 'Chưa xóa được cột')),
  });

  const move = (index, dir) => {
    const ids = columns.map((c) => c.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    reorder.mutate(ids);
  };
  const onDelete = async (col) => {
    const n = taskCounts[col.id] || 0;
    const ok = await confirm({
      title: `Xóa cột "${col.name}"?`,
      message: n ? `${n} task trong cột này sẽ quay về cột "Đang làm". Task không bị xóa.` : 'Cột đang trống nên không ảnh hưởng task nào.',
      confirmText: 'Xóa cột', tone: 'danger',
    });
    if (ok) remove.mutate(col.id);
  };

  const canAdd = newName.trim().length >= 2 && columns.length < MAX_CUSTOM_COLUMNS;
  const busy = save.isPending || reorder.isPending || remove.isPending;
  const nameChanged = wsName.trim() !== workspace.name && wsName.trim().length >= 3;

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Tùy chỉnh bảng">
      <div className="bg-white w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0"><Icon name="cog" className="w-5 h-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900 leading-tight">Tùy chỉnh bảng</h2>
            <p className="text-xs text-gray-500">Chỉ Admin và Lead thấy mục này</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-6">
          <section>
            <label htmlFor="ws-name" className="block text-sm font-semibold text-gray-800 mb-1.5">Tên Workspace</label>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (nameChanged && !rename.isPending) rename.mutate(); }}>
              <input id="ws-name" className="input-field flex-1" value={wsName} maxLength={120} onChange={(e) => setWsName(e.target.value)} />
              <button type="submit" disabled={!nameChanged || rename.isPending} className="btn-primary text-sm">Lưu</button>
            </form>
          </section>

          <section>
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-800">Các cột của bảng</h3>
              <span className="text-xs text-gray-400">{columns.length}/{MAX_CUSTOM_COLUMNS} cột thêm</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Cột thêm nằm giữa <strong>Đang làm</strong> và <strong>Chờ duyệt</strong>; task trong đó vẫn tính là đang làm và đi tiếp qua nộp sản phẩm, nghiệm thu như bình thường.</p>

            <ol className="space-y-2">
              <li className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500"><Icon name="lock" className="w-4 h-4 text-gray-400" />Cần làm<span className="ml-auto text-xs">mặc định</span></li>
              <li className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500"><Icon name="lock" className="w-4 h-4 text-gray-400" />Đang làm<span className="ml-auto text-xs">mặc định</span></li>
              {columns.map((c, i) => (
                <ColumnRow key={c.id} col={c} index={i} total={columns.length} count={taskCounts[c.id] || 0} busy={busy}
                  onSave={(patch) => save.mutate({ columnId: c.id, patch })} onMove={(dir) => move(i, dir)} onDelete={() => onDelete(c)} />
              ))}
              <li className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500"><Icon name="lock" className="w-4 h-4 text-gray-400" />Chờ duyệt<span className="ml-auto text-xs">mặc định</span></li>
              <li className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500"><Icon name="lock" className="w-4 h-4 text-gray-400" />Hoàn thành<span className="ml-auto text-xs">mặc định</span></li>
            </ol>

            <form className="mt-4 rounded-xl border border-dashed border-gray-300 p-3 flex flex-wrap items-center gap-x-3 gap-y-2" onSubmit={(e) => { e.preventDefault(); if (canAdd && !add.isPending) add.mutate(); }}>
              <input className="input-field !py-1.5 flex-1 min-w-[10rem]" placeholder={columns.length >= MAX_CUSTOM_COLUMNS ? 'Đã đủ số cột tối đa' : 'Tên cột mới, ví dụ: Đang kiểm thử'} value={newName} maxLength={40}
                disabled={columns.length >= MAX_CUSTOM_COLUMNS} onChange={(e) => setNewName(e.target.value)} aria-label="Tên cột mới" />
              <Swatches value={newColor} onChange={setNewColor} />
              <button type="submit" disabled={!canAdd || add.isPending} className="btn-primary text-sm !py-1.5"><Icon name="plus" className="w-4 h-4" />Thêm cột</button>
            </form>
          </section>
        </div>

        <div className="flex justify-end px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Xong</button>
        </div>
      </div>
    </div>
  );
}
