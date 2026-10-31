import { useMemo, useState } from 'react';

// Loại mục trên sơ đồ. DEVHUB là dự án thật trên nền tảng (tự động, có xác thực).
export const EXP_TYPES = {
  COMPANY: { label: 'Công ty', lane: 'Công ty', bar: 'bg-primary-500 hover:bg-primary-600', soft: 'bg-primary-50 text-primary-700 ring-primary-200', nameLabel: 'Tên công ty', roleLabel: 'Chức danh' },
  PROJECT: { label: 'Dự án trong công ty', lane: 'Dự án trong công ty', bar: 'bg-sky-400 hover:bg-sky-500', soft: 'bg-sky-50 text-sky-700 ring-sky-200', nameLabel: 'Tên dự án', roleLabel: 'Vai trò trong dự án' },
  DEVHUB: { label: 'Dự án trên DevHub', lane: 'Dự án DevHub', bar: 'bg-emerald-500 hover:bg-emerald-600', soft: 'bg-emerald-50 text-emerald-700 ring-emerald-200', nameLabel: 'Tên dự án', roleLabel: 'Vị trí' },
  FREELANCE: { label: 'Freelance', lane: 'Freelance', bar: 'bg-amber-500 hover:bg-amber-600', soft: 'bg-amber-50 text-amber-700 ring-amber-200', nameLabel: 'Khách hàng / dự án', roleLabel: 'Vai trò' },
  PERSONAL: { label: 'Dự án cá nhân', lane: 'Dự án cá nhân', bar: 'bg-violet-500 hover:bg-violet-600', soft: 'bg-violet-50 text-violet-700 ring-violet-200', nameLabel: 'Tên dự án', roleLabel: 'Vai trò' },
};
const LANE_ORDER = ['COMPANY', 'PROJECT', 'DEVHUB', 'FREELANCE', 'PERSONAL'];
const DAY = 86400000;

const ts = (d) => (d ? new Date(d).getTime() : null);
const monthYear = (t) => { const d = new Date(t); return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
const durationText = (a, b) => {
  const months = Math.max(0, Math.round((b - a) / (DAY * 30.4375)));
  if (months < 1) return 'dưới 1 tháng';
  const y = Math.floor(months / 12); const m = months % 12;
  return [y ? `${y} năm` : '', m ? `${m} tháng` : ''].filter(Boolean).join(' ');
};

// Chuẩn hóa kinh nghiệm tự khai + dự án DevHub về cùng một dạng
function buildItems(experiences, devhubProjects) {
  const now = Date.now();
  const items = [];
  for (const e of experiences || []) {
    const start = ts(e.start_date);
    if (!start) continue;
    items.push({
      key: `exp-${e.id}`, raw: e, id: e.id, type: e.type || 'COMPANY', parentId: e.parent_id || null,
      name: e.company_name, role: e.job_title, start, end: ts(e.end_date), ongoing: !e.end_date,
      description: e.description, tasks: e.tasks || [], technologies: e.technologies || [], link: e.link_url,
    });
  }
  for (const p of devhubProjects || []) {
    const pr = p.project || {};
    const start = ts(pr.start_date) || ts(p.joined_at);
    if (!start) continue;
    const finished = pr.status === 'COMPLETED' || p.member_status === 'COMPLETED';
    const end = ts(pr.actual_end_date) || (finished ? (ts(pr.expected_end_date) || start) : null);
    items.push({
      key: `dh-${p.member_id}`, raw: p, id: p.member_id, type: 'DEVHUB', parentId: null,
      name: pr.name || 'Dự án DevHub', role: p.position || 'Thành viên', start, end: end && end >= start ? end : null,
      ongoing: !finished, description: pr.description, tasks: [],
      technologies: (p.skills || []).map((s) => s.name), evaluation: p.evaluation, verified: true,
    });
  }
  return items.map((it) => ({ ...it, endT: it.end ?? now }));
}

// Xếp các mục trong một làn thành nhiều hàng sao cho không đè lên nhau
function packRows(list) {
  const rows = [];
  const placed = [...list].sort((a, b) => a.start - b.start).map((it) => {
    let r = rows.findIndex((last) => last <= it.start);
    if (r === -1) { r = rows.length; rows.push(0); }
    rows[r] = it.endT;
    return { it, row: r };
  });
  return { placed, rowCount: Math.max(1, rows.length) };
}

// Khoảng thời gian có từ 2 mục "chính" (không tính dự án con) chạy song song
function parallelBands(items) {
  const main = items.filter((i) => i.type !== 'PROJECT');
  const pts = [...new Set(main.flatMap((i) => [i.start, i.endT]))].sort((a, b) => a - b);
  const bands = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const mid = (pts[k] + pts[k + 1]) / 2;
    if (main.filter((i) => i.start <= mid && mid < i.endT).length >= 2) {
      const last = bands[bands.length - 1];
      if (last && last[1] === pts[k]) last[1] = pts[k + 1]; else bands.push([pts[k], pts[k + 1]]);
    }
  }
  return bands;
}

function Chip({ children, className = '' }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>{children}</span>;
}

// Sơ đồ kinh nghiệm theo thời gian (swimlane). editable = true ở trang ứng viên (có nút sửa / xóa / thêm dự án).
export default function ExperienceTimeline({ experiences = [], devhubProjects = [], editable = false, onEdit, onDelete, onAddProject, emptyHint }) {
  const items = useMemo(() => buildItems(experiences, devhubProjects), [experiences, devhubProjects]);
  const [filter, setFilter] = useState('ALL');
  const [selectedKey, setSelectedKey] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);

  const typesPresent = LANE_ORDER.filter((t) => items.some((i) => i.type === t));
  const visible = filter === 'ALL' ? items : items.filter((i) => i.type === filter);
  const selected = items.find((i) => i.key === selectedKey) || [...items].sort((a, b) => b.endT - a.endT || b.start - a.start)[0];

  const { min, max, ticks } = useMemo(() => {
    if (!items.length) return { min: 0, max: 1, ticks: [] };
    const lo = new Date(Math.min(...items.map((i) => i.start))); lo.setMonth(0, 1); lo.setHours(0, 0, 0, 0);
    const hi = Math.max(...items.map((i) => i.endT), Date.now()) + 20 * DAY;
    const span = new Date(hi).getFullYear() - lo.getFullYear();
    const step = span > 12 ? 3 : span > 6 ? 2 : 1;
    const t = [];
    for (let y = lo.getFullYear(); y <= new Date(hi).getFullYear(); y += step) t.push({ y, t: new Date(y, 0, 1).getTime() });
    return { min: lo.getTime(), max: hi, ticks: t };
  }, [items]);

  const pct = (t) => ((t - min) / (max - min)) * 100;
  const bands = useMemo(() => parallelBands(visible), [visible]);
  const lanes = LANE_ORDER.map((type) => {
    const list = visible.filter((i) => i.type === type);
    return list.length ? { type, ...packRows(list) } : null;
  }).filter(Boolean);

  if (!items.length) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500 text-sm font-medium">{emptyHint || 'Chưa có kinh nghiệm nào.'}</p>
      </div>
    );
  }

  const overlapping = selected
    ? items.filter((o) => o.key !== selected.key && o.type !== 'PROJECT' && selected.type !== 'PROJECT'
      && o.start < selected.endT && selected.start < o.endT)
    : [];
  const children = selected?.type === 'COMPANY' ? items.filter((i) => i.parentId === selected.id) : [];
  const parent = selected?.parentId ? items.find((i) => i.id === selected.parentId) : null;
  const meta = selected ? EXP_TYPES[selected.type] : null;

  return (
    <div>
      {/* Bộ lọc loại */}
      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="Lọc theo loại kinh nghiệm">
        {['ALL', ...typesPresent].map((t) => (
          <button key={t} type="button" onClick={() => setFilter(t)} aria-pressed={filter === t}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${filter === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
            {t === 'ALL' ? `Tất cả (${items.length})` : `${EXP_TYPES[t].label} (${items.filter((i) => i.type === t).length})`}
          </button>
        ))}
      </div>

      {/* Sơ đồ */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <div className="min-w-[640px] p-3">
          <div className="flex">
            <div className="w-28 shrink-0" />
            <div className="relative flex-1 h-5 text-[11px] text-slate-400">
              {ticks.map((tk) => <span key={tk.y} className="absolute -translate-x-1/2" style={{ left: `${pct(tk.t)}%` }}>{tk.y}</span>)}
            </div>
          </div>
          {lanes.length === 0 && <p className="text-sm text-slate-400 py-6 text-center">Không có mục nào thuộc loại này.</p>}
          {lanes.map((lane, laneIdx) => (
            <div key={lane.type} className="flex border-t border-slate-100">
              <div className="w-28 shrink-0 pr-2 py-2 text-xs font-semibold text-slate-600 flex items-start">{EXP_TYPES[lane.type].lane}</div>
              <div className="relative flex-1" style={{ height: lane.rowCount * 34 + 8 }}>
                {ticks.map((tk) => <span key={tk.y} className="absolute top-0 bottom-0 border-l border-slate-100" style={{ left: `${pct(tk.t)}%` }} />)}
                {bands.map(([a, b]) => (
                  <span key={a} className="absolute top-0 bottom-0 bg-amber-300/20 pointer-events-none" style={{ left: `${pct(a)}%`, width: `${pct(b) - pct(a)}%` }} />
                ))}
                {lane.placed.map(({ it, row }) => {
                  const isSel = selected?.key === it.key;
                  const isHovered = hoveredKey === it.key;
                  const leftPct = pct(it.start);
                  const widthPct = Math.max(pct(it.endT) - leftPct, 1.5);
                  const rightEdgePct = Math.min(100, leftPct + widthPct);
                  const isNearRight = leftPct > 60;
                  const showTooltipBelow = laneIdx === 0 && row === 0;

                  const posStyle = isHovered
                    ? (isNearRight
                      ? { right: `${100 - rightEdgePct}%`, minWidth: `${widthPct}%`, maxWidth: `${rightEdgePct}%`, width: 'auto', top: row * 34 + 4 }
                      : { left: `${leftPct}%`, minWidth: `${widthPct}%`, maxWidth: `${100 - leftPct}%`, width: 'auto', top: row * 34 + 4 })
                    : { left: `${leftPct}%`, width: `${widthPct}%`, top: row * 34 + 4 };

                  return (
                    <div
                      key={it.key}
                      style={posStyle}
                      onMouseEnter={() => setHoveredKey(it.key)}
                      onMouseLeave={() => setHoveredKey((prev) => (prev === it.key ? null : prev))}
                      className={`absolute h-7 ${isHovered ? 'z-30' : isSel ? 'z-10' : 'z-0'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedKey(it.key)}
                        onFocus={() => setHoveredKey(it.key)}
                        onBlur={() => setHoveredKey((prev) => (prev === it.key ? null : prev))}
                        className={`w-full h-full rounded-md text-left text-[11px] font-semibold text-white px-2 transition ${EXP_TYPES[it.type].bar} ${
                          isHovered ? 'whitespace-nowrap shadow-lg ring-2 ring-slate-900/80 px-2.5' : 'truncate'
                        } ${isSel && !isHovered ? 'ring-2 ring-offset-1 ring-slate-900' : ''}`}
                      >
                        {it.name}
                      </button>

                      {isHovered && (
                        <div
                          className={`pointer-events-none absolute ${
                            showTooltipBelow ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
                          } ${isNearRight ? 'right-0' : 'left-0'} z-40 w-max max-w-xs rounded-lg bg-slate-900 px-3 py-2 text-white shadow-xl`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold leading-snug break-words">{it.name}</p>
                            {it.evaluation?.score !== undefined && it.evaluation?.score !== null && (
                              <span className="shrink-0 inline-flex items-center gap-0.5 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                ★ {Number(it.evaluation.score).toFixed(1)}/10
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {it.role} · {monthYear(it.start)} – {it.ongoing ? 'Hiện tại' : monthYear(it.endT)} ({durationText(it.start, it.endT)})
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {bands.length > 0 && <p className="text-xs text-slate-500 mt-2"><span className="inline-block w-3 h-3 align-middle bg-amber-300/40 border border-amber-300 rounded-sm mr-1" />Vùng vàng: thời gian làm nhiều việc song song.</p>}

      {/* Chi tiết mục đang chọn */}
      {selected && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4 bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${meta.soft}`}>{meta.label}</span>
                {selected.verified && <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-600 text-white">Đã xác thực bởi DevHub</span>}
                {selected.ongoing && <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-primary-50 text-primary-700">Đang diễn ra</span>}
              </div>
              <h4 className="font-bold text-slate-900 text-lg">{selected.name}</h4>
              <p className="text-sm font-medium text-slate-600">{selected.role}</p>
              <p className="text-xs text-slate-500 mt-1">
                {monthYear(selected.start)} – {selected.ongoing ? 'Hiện tại' : monthYear(selected.endT)} · {durationText(selected.start, selected.endT)}
                {parent && <> · thuộc <button type="button" className="text-primary-700 hover:underline" onClick={() => setSelectedKey(parent.key)}>{parent.name}</button></>}
              </p>
            </div>
            {editable && !selected.verified && (
              <div className="flex gap-2">
                {selected.type === 'COMPANY' && onAddProject && (
                  <button type="button" onClick={() => onAddProject(selected.raw)} className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg">+ Dự án trong công ty</button>
                )}
                <button type="button" onClick={() => onEdit?.(selected.raw)} className="px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg">Sửa</button>
                <button type="button" onClick={() => onDelete?.(selected.raw)} className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg">Xóa</button>
              </div>
            )}
          </div>

          {selected.evaluation && (
            <p className="mt-3 text-sm text-slate-700">Điểm đánh giá: <b>{Number(selected.evaluation.score)}/10</b>{selected.evaluation.comment && <span className="italic text-slate-500"> — “{selected.evaluation.comment}”</span>}</p>
          )}
          {selected.description && <p className="mt-3 text-sm text-slate-600 whitespace-pre-line leading-relaxed">{selected.description}</p>}
          {selected.tasks.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">Đã làm cụ thể</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">{selected.tasks.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
          {selected.technologies.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">{selected.type === 'DEVHUB' ? 'Kỹ năng của vị trí' : 'Công nghệ / kỹ năng'}</p>
              <div className="flex flex-wrap gap-1.5">{selected.technologies.map((t) => <Chip key={t}>{t}</Chip>)}</div>
            </div>
          )}
          {selected.link && <p className="mt-3 text-sm"><a href={selected.link} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline break-all">{selected.link}</a></p>}

          {children.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-1">Dự án trong công ty ({children.length})</p>
              <ul className="space-y-1">
                {children.map((c) => (
                  <li key={c.key}><button type="button" onClick={() => setSelectedKey(c.key)} className="text-sm text-sky-700 hover:underline text-left">{c.name} <span className="text-slate-400">({monthYear(c.start)} – {c.ongoing ? 'nay' : monthYear(c.endT)})</span></button></li>
                ))}
              </ul>
            </div>
          )}
          {overlapping.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">Làm song song với</p>
              <ul className="space-y-1">
                {overlapping.map((o) => (
                  <li key={o.key}><button type="button" onClick={() => setSelectedKey(o.key)} className="text-sm text-slate-700 hover:underline text-left">{o.name} <span className="text-slate-400">· {EXP_TYPES[o.type].label}</span></button></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
