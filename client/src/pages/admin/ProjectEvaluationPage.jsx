import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';
import Avatar from '@/components/common/Avatar';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PageBanner from '@/components/common/PageBanner';
import { useConfirm } from '@/components/common/ConfirmDialog';

// Trang chấm điểm năng lực cho cả dự án (mở ra ngay sau khi đóng dự án, hoặc từ thẻ dự án đã đóng).
//  - Tab "Chấm điểm": mỗi thành viên một thẻ lớn (điểm 0–10, bước 0,5, nhận xét), lưu một lần cho cả dự án.
//  - Tab "Thống kê": ai được chấm bao nhiêu điểm, điểm trung bình, phân bố xếp loại.
// Điểm từ QUALIFY trở lên được cộng vào điểm tích lũy / danh hiệu của ứng viên (cùng ngưỡng với server).

const QUALIFY = 5;
const QUICK = [
  { v: 5, l: 'Đạt' },
  { v: 7, l: 'Khá' },
  { v: 8.5, l: 'Giỏi' },
  { v: 9.5, l: 'Xuất sắc' },
];

// Xếp loại: cùng mốc với bảng danh hiệu của ứng viên (Xuất sắc ≥ 9, Giỏi ≥ 8, Khá ≥ 6,5, Đạt ≥ 5)
const GRADES = [
  { key: 'excellent', label: 'Xuất sắc', min: 9, range: '9 – 10', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { key: 'good', label: 'Giỏi', min: 8, range: '8 – dưới 9', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { key: 'fair', label: 'Khá', min: 6.5, range: '6,5 – dưới 8', chip: 'bg-primary-50 text-primary-700 ring-primary-200' },
  { key: 'pass', label: 'Đạt', min: QUALIFY, range: '5 – dưới 6,5', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { key: 'fail', label: 'Chưa đạt', min: 0, range: 'dưới 5', chip: 'bg-red-50 text-red-700 ring-red-200' },
];
const gradeOf = (s) => GRADES.find((g) => s >= g.min) || GRADES[GRADES.length - 1];
const fmt = (n) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10).replace('.', ','));
const same = (a, b) => (a ?? null) === (b ?? null);

const GradeChip = ({ score }) => {
  const g = gradeOf(score);
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${g.chip}`}>
      {g.key === 'fail' && <Icon name="alert" className="h-3.5 w-3.5" />}{g.label}
    </span>
  );
};

const StateChip = ({ state }) => {
  const map = {
    unsaved: ['Chưa lưu', 'bg-amber-50 text-amber-700 ring-amber-200'],
    saved: ['Đã lưu', 'bg-emerald-50 text-emerald-700 ring-emerald-200'],
    none: ['Chưa chấm', 'bg-gray-100 text-gray-600 ring-gray-200'],
  };
  const [text, cls] = map[state];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>{text}</span>;
};

// ─── Tab chấm điểm ────────────────────────────────────────────────────────────

function ScoreCard({ m, row, onChange }) {
  const score = row.score;
  const has = score !== null && score !== undefined;
  const changed = has && (!same(score, m.evaluation?.score) || (row.comment.trim() || '') !== (m.evaluation?.comment || ''));
  const state = changed ? 'unsaved' : m.evaluation ? 'saved' : 'none';
  const pct = m.tasks.total > 0 ? Math.round((m.tasks.done / m.tasks.total) * 100) : 0;
  return (
    <li className={`card !p-5 ${changed ? 'border-amber-200' : ''}`}>
      <div className="grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-3">
            <Avatar name={m.user.full_name} src={m.avatar_url} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-bold text-gray-900">{m.user.full_name}</p>
              <p className="truncate text-xs text-gray-500">{m.position || m.professional_title || 'Thành viên dự án'}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StateChip state={state} />
            {m.role === 'LEAD' && <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-200">Lead</span>}
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
              <span>Việc được giao</span>
              <span className="font-semibold text-gray-700">{m.tasks.total > 0 ? `${m.tasks.done}/${m.tasks.total} xong` : 'Chưa có'}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-r bg-primary-500" style={{ width: `${pct}%` }} /></div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Điểm năng lực</p>
              <p className="mt-0.5 text-4xl font-extrabold leading-none text-gray-900">
                {has ? fmt(score) : '—'}<span className="text-base font-semibold text-gray-400">/10</span>
              </p>
            </div>
            {has ? <GradeChip score={score} /> : <span className="text-sm text-gray-400">Chọn điểm bên dưới</span>}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {QUICK.map((q) => (
              <button key={q.v} type="button" onClick={() => onChange({ score: q.v })} aria-pressed={score === q.v} aria-label={`${q.l}, ${fmt(q.v)} điểm`} title={`${q.l} · ${fmt(q.v)} điểm`}
                className={`whitespace-nowrap rounded-full border px-1 py-1 text-center text-xs font-semibold transition-colors ${score === q.v ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700'}`}>
                {q.l}
              </button>
            ))}
          </div>
          <input type="range" min="0" max="10" step="0.5" value={has ? score : 5} aria-label={`Điểm của ${m.user.full_name}`}
            onChange={(e) => onChange({ score: Number(e.target.value) })}
            className={`mt-4 w-full ${has ? 'accent-primary-600' : 'accent-gray-300'}`} />
          <div className="mt-0.5 flex justify-between text-xs text-gray-400"><span>0</span><span>5</span><span>10</span></div>
          {has && score < QUALIFY && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600"><Icon name="alert" className="h-3.5 w-3.5" />Dưới {QUALIFY}/10 nên dự án này không được cộng vào điểm tích lũy của ứng viên.</p>
          )}

          <label className="mt-4 block text-xs font-semibold text-gray-600" htmlFor={`cmt-${m.member_id}`}>Nhận xét <span className="font-normal text-gray-400">(không bắt buộc, ứng viên sẽ đọc được)</span></label>
          <textarea id={`cmt-${m.member_id}`} value={row.comment} onChange={(e) => onChange({ comment: e.target.value })} rows={3} maxLength={2000}
            placeholder="Chất lượng công việc, thái độ, kỹ năng nổi bật, điểm cần cải thiện..." className="input-field mt-1 resize-none text-sm" />
        </div>
      </div>
    </li>
  );
}

// ─── Tab thống kê ─────────────────────────────────────────────────────────────

function Stats({ members, onGoScore }) {
  const scored = useMemo(() => members.filter((m) => m.evaluation)
    .sort((a, b) => b.evaluation.score - a.evaluation.score || a.user.full_name.localeCompare(b.user.full_name, 'vi')), [members]);
  const unscored = members.filter((m) => !m.evaluation);

  if (scored.length === 0) {
    return (
      <div className="card py-14 text-center">
        <IconBadge name="chart" tone="slate" size="lg" className="mx-auto" />
        <p className="mt-3 font-semibold text-gray-800">Chưa có điểm nào được lưu</p>
        <p className="mt-1 text-sm text-gray-500">Hãy chấm điểm và bấm "Lưu điểm" để xem thống kê.</p>
        <button type="button" onClick={onGoScore} className="btn-primary mt-4">Đi tới chấm điểm</button>
      </div>
    );
  }

  const scores = scored.map((m) => m.evaluation.score);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const dist = GRADES.map((g) => ({ ...g, count: scores.filter((s) => gradeOf(s).key === g.key).length }));
  const maxCount = Math.max(...dist.map((d) => d.count), 1);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="card !p-5" aria-labelledby="stat-members">
          <h2 id="stat-members" className="font-bold text-gray-900">Chi tiết và nhận xét</h2>
          <p className="text-xs text-gray-500">Xếp từ cao xuống thấp · {scored.length} thành viên đã chấm · điểm trung bình <strong className="text-gray-800">{fmt(avg)}/10</strong></p>
          <ol className="mt-3 divide-y divide-gray-100">
            {scored.map((m, i) => {
              const s = m.evaluation.score;
              return (
                <li key={m.member_id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3">
                  <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={m.user.full_name} src={m.avatar_url} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-gray-900">{m.user.full_name}</span>
                      <span className="block truncate text-xs text-gray-500">{m.position || 'Thành viên dự án'}</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-base font-extrabold text-gray-900">{fmt(s)}<span className="text-xs font-semibold text-gray-400">/10</span></span>
                    <GradeChip score={s} />
                  </span>
                  {m.evaluation.comment && <span className="col-span-3 line-clamp-3 pl-[2.25rem] text-xs italic text-gray-500">“{m.evaluation.comment}”</span>}
                </li>
              );
            })}
          </ol>

          {unscored.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800"><Icon name="clock" className="h-4 w-4" />Chưa được chấm ({unscored.length})</p>
              <p className="mt-1 text-sm text-gray-700">{unscored.map((m) => m.user.full_name).join(', ')}</p>
              <button type="button" onClick={onGoScore} className="mt-2 text-sm font-semibold text-primary-700 hover:text-primary-800">Chấm tiếp →</button>
            </div>
          )}
        </section>

        <section className="card !p-5 self-start" aria-labelledby="stat-dist">
          <h2 id="stat-dist" className="font-bold text-gray-900">Phân bố xếp loại</h2>
          <p className="text-xs text-gray-500">Số thành viên ở mỗi mức điểm.</p>
          <ul className="mt-4 space-y-3.5">
            {dist.map((d) => (
              <li key={d.key} title={`${d.label} (${d.range}): ${d.count} thành viên`}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-gray-800">{d.label} <span className="text-xs font-normal text-gray-400">{d.range}</span></span>
                  <span className="font-bold text-gray-900">{d.count}</span>
                </div>
                <div className="relative h-2.5 rounded-full bg-gray-100">
                  {d.count > 0 && <div className={`h-full rounded-r ${d.key === 'fail' ? 'bg-red-400' : 'bg-primary-500'}`} style={{ width: `${(d.count / maxCount) * 100}%` }} />}
                </div>
              </li>
            ))}
            {unscored.length > 0 && (
              <li>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm"><span className="font-semibold text-gray-500">Chưa chấm</span><span className="font-bold text-gray-500">{unscored.length}</span></div>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

// ─── Trang ────────────────────────────────────────────────────────────────────

export default function ProjectEvaluationPage() {
  const { projectId } = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const view = search.get('view') === 'stats' ? 'stats' : 'score';
  const thenPay = search.get('then') === 'pay';
  const [rows, setRows] = useState({}); // member_id → { score, comment }
  const [justSaved, setJustSaved] = useState(null); // { n } sau khi lưu xong

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-project-evaluations', projectId],
    queryFn: () => adminApi.getProjectEvaluations(projectId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const info = data?.data?.data;
  const project = info?.project;
  const members = useMemo(() => info?.members || [], [info]);
  const payUrl = project?.workspace_id ? `/admin/payments?view=projects&project=${project.workspace_id}` : '/admin/payments?view=projects';

  // Điểm đã lưu được nạp sẵn để xem / sửa
  useEffect(() => {
    const next = {};
    members.forEach((m) => { next[m.member_id] = { score: m.evaluation?.score ?? null, comment: m.evaluation?.comment || '' }; });
    setRows(next);
  }, [members]);

  const patch = (id, p) => { setRows((r) => ({ ...r, [id]: { ...r[id], ...p } })); setJustSaved(null); };
  const setView = (v) => setSearch((prev) => { const n = new URLSearchParams(prev); if (v === 'stats') n.set('view', 'stats'); else n.delete('view'); return n; }, { replace: true });

  const dirty = members.filter((m) => {
    const r = rows[m.member_id];
    if (!r || r.score === null || r.score === undefined) return false;
    return !same(r.score, m.evaluation?.score) || (r.comment.trim() || '') !== (m.evaluation?.comment || '');
  });
  const scoredNow = members.filter((m) => rows[m.member_id]?.score !== null && rows[m.member_id]?.score !== undefined);
  const savedCount = members.filter((m) => m.evaluation).length;
  const total = members.length;
  const pct = total ? Math.round((scoredNow.length / total) * 100) : 0;
  const avgNow = scoredNow.length ? scoredNow.reduce((s, m) => s + rows[m.member_id].score, 0) / scoredNow.length : null;

  // Chưa lưu mà rời trang: hỏi lại (đóng tab thì trình duyệt tự hỏi)
  useEffect(() => {
    if (dirty.length === 0) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty.length]);
  const leave = async (to) => {
    if (dirty.length > 0 && !(await confirm({
      title: 'Bỏ các điểm chưa lưu?',
      message: `Bạn đã chấm điểm cho ${dirty.length} thành viên nhưng chưa lưu. Rời trang bây giờ thì các điểm này sẽ mất.`,
      confirmText: 'Bỏ và rời trang',
      tone: 'danger',
    }))) return;
    navigate(to);
  };

  const save = useMutation({
    mutationFn: () => adminApi.saveProjectEvaluations(projectId, dirty.map((m) => ({
      member_id: m.member_id, score: rows[m.member_id].score, comment: rows[m.member_id].comment.trim() || null,
    }))),
    onSuccess: async (res) => {
      const n = res.data?.data?.saved || 0;
      toast.success(n > 0 ? `Đã lưu điểm năng lực cho ${n} thành viên` : 'Điểm không thay đổi');
      ['admin-projects', 'admin-dashboard', 'admin-project-jobs', 'admin-candidates'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      await qc.invalidateQueries({ queryKey: ['admin-project-evaluations', projectId] });
      setJustSaved({ n });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không lưu được điểm'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !project) {
    return (
      <div className="card mx-auto mt-6 max-w-lg py-12 text-center">
        <IconBadge name="alert" tone="amber" size="lg" className="mx-auto" />
        <p className="mt-3 font-semibold text-gray-800">Không tải được dự án này</p>
        <Link to="/admin/projects" className="btn-primary mt-4 inline-flex">Về danh sách dự án</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageBanner compact icon="star" title="Chấm điểm năng lực thành viên" subtitle={`Dự án: ${project.name}`}>
        <button type="button" onClick={() => leave('/admin/projects')} className="btn-light">
          <Icon name="chevronLeft" className="h-4 w-4" />Về danh sách dự án
        </button>
      </PageBanner>

      {!project.is_closed && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <IconBadge name="alert" tone="amber" />
          <div>
            <p className="font-semibold text-amber-900">Dự án chưa đóng</p>
            <p className="text-sm text-amber-800">Chỉ chấm điểm được sau khi dự án đã đóng (nghiệm thu hoàn thành). Hãy đóng dự án ở danh sách dự án rồi quay lại đây.</p>
          </div>
        </div>
      )}

      <div className="card !p-3 flex flex-wrap items-center gap-2" role="tablist" aria-label="Chế độ xem">
        {[
          { v: 'score', l: 'Chấm điểm', count: `${scoredNow.length}/${total}` },
          { v: 'stats', l: 'Thống kê', count: savedCount },
        ].map((t) => (
          <button key={t.v} type="button" role="tab" aria-selected={view === t.v} onClick={() => setView(t.v)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${view === t.v ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-700'}`}>
            <Icon name={t.v === 'score' ? 'star' : 'chart'} className="h-4 w-4" />{t.l}
            <span className={`rounded-full px-1.5 text-xs ${view === t.v ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {view === 'stats' ? (
        <>
          {dirty.length > 0 && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
              <Icon name="info" className="h-4 w-4 flex-shrink-0" />Có {dirty.length} điểm chưa lưu nên chưa được tính vào thống kê. <button type="button" className="font-semibold underline" onClick={() => setView('score')}>Quay lại để lưu</button>
            </p>
          )}
          <Stats members={members} onGoScore={() => setView('score')} />
          {thenPay && (
            <div className="flex justify-end"><Link to={payUrl} className="btn-primary">Tiếp tục sang thanh toán<Icon name="arrowRight" className="h-4 w-4" /></Link></div>
          )}
        </>
      ) : (
        <>
          {justSaved && (
            <div className="card !p-4 flex flex-wrap items-center gap-3 border-emerald-200 bg-emerald-50/70" role="status">
              <IconBadge name="check" tone="green" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{justSaved.n > 0 ? `Đã lưu điểm cho ${justSaved.n} thành viên` : 'Điểm không thay đổi'}</p>
                <p className="text-sm text-gray-600">{savedCount < total ? `Còn ${total - savedCount} thành viên chưa được chấm, bạn có thể chấm tiếp.` : 'Cả dự án đã được chấm điểm đầy đủ.'}</p>
              </div>
              <button type="button" onClick={() => setView('stats')} className="btn-primary"><Icon name="chart" className="h-4 w-4" />Xem thống kê</button>
              {thenPay && <Link to={payUrl} className="btn-secondary">Tiếp tục sang thanh toán</Link>}
            </div>
          )}

          {total === 0 ? (
            <div className="card py-14 text-center text-sm text-gray-500">Dự án này không có thành viên nào để chấm điểm.</div>
          ) : (
            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
              <aside className="card !p-5 lg:sticky lg:top-24 lg:order-2" aria-label="Tiến độ chấm điểm">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tiến độ chấm điểm</p>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">{scoredNow.length}<span className="text-lg font-semibold text-gray-400">/{total}</span></p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-r transition-all ${scoredNow.length < total ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">{scoredNow.length < total ? `Còn ${total - scoredNow.length} thành viên chưa chấm` : 'Đã chấm đủ mọi thành viên'}</p>
                <dl className="mt-4 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Điểm trung bình</dt><dd className="font-bold text-gray-900">{avgNow === null ? '—' : `${fmt(avgNow)}/10`}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Chưa lưu</dt><dd className={`font-bold ${dirty.length ? 'text-amber-600' : 'text-gray-900'}`}>{dirty.length}</dd></div>
                </dl>
                <button type="button" disabled={save.isPending || dirty.length === 0 || !project.is_closed} onClick={() => save.mutate()} className="btn-primary mt-4 w-full disabled:opacity-50">
                  <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />{save.isPending ? 'Đang lưu...' : `Lưu điểm${dirty.length ? ` (${dirty.length})` : ''}`}
                </button>
                <button type="button" disabled={savedCount === 0} onClick={() => setView('stats')} className="btn-secondary mt-2 w-full disabled:opacity-50">
                  <Icon name="chart" className="h-4 w-4" />Xem thống kê
                </button>
                {thenPay && (
                  <button type="button" onClick={() => leave(payUrl)} className="mt-3 w-full text-center text-sm font-semibold text-primary-700 hover:text-primary-800">
                    {savedCount > 0 && dirty.length === 0 ? 'Tiếp tục sang thanh toán →' : 'Để sau, sang thanh toán →'}
                  </button>
                )}
                <p className="mt-4 rounded-xl bg-primary-50 p-3 text-xs leading-relaxed text-primary-800">
                  Điểm từ <strong>{QUALIFY}/10</strong> trở lên được cộng vào điểm tích lũy và danh hiệu của ứng viên. Ứng viên nhận thông báo kèm nhận xét.
                </p>
              </aside>

              <div className="min-w-0 lg:order-1">
                <ul className="space-y-4">
                  {members.map((m) => (
                    <ScoreCard key={m.member_id} m={m} row={rows[m.member_id] || { score: null, comment: '' }} onChange={(p) => patch(m.member_id, p)} />
                  ))}
                </ul>
                <div className="mt-4 flex justify-end lg:hidden">
                  <button type="button" disabled={save.isPending || dirty.length === 0 || !project.is_closed} onClick={() => save.mutate()} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
                    <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />{save.isPending ? 'Đang lưu...' : `Lưu điểm${dirty.length ? ` (${dirty.length})` : ''}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
