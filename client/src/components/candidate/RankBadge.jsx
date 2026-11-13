import Icon from '@/components/common/Icon';

// Danh hiệu ứng viên: hạng theo điểm tích lũy từ các dự án DevHub (xét cả số dự án lẫn điểm đánh giá), dữ liệu do server tính: /candidates/rank
const TIER_STYLE = {
  newbie: { pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', grad: 'from-emerald-400 to-emerald-600', solid: 'from-emerald-500 to-emerald-600 text-white', icon: 'text-emerald-600', bar: 'bg-emerald-500', iconName: 'sprout' },
  bronze: { pill: 'bg-orange-50 text-orange-700 ring-orange-200', grad: 'from-orange-400 to-amber-700', solid: 'from-orange-500 to-orange-700 text-white', icon: 'text-orange-600', bar: 'bg-orange-500', iconName: 'rocket' },
  silver: { pill: 'bg-slate-100 text-slate-700 ring-slate-300', grad: 'from-slate-300 to-slate-500', solid: 'from-slate-400 to-slate-600 text-white', icon: 'text-slate-500', bar: 'bg-slate-500', iconName: 'handshake' },
  gold: { pill: 'bg-yellow-50 text-yellow-800 ring-yellow-300', grad: 'from-yellow-300 to-amber-500', solid: 'from-yellow-300 to-amber-500 text-amber-950', icon: 'text-amber-500', bar: 'bg-amber-500', iconName: 'trophy' },
  diamond: { pill: 'bg-cyan-50 text-cyan-800 ring-cyan-300', grad: 'from-cyan-300 to-blue-500', solid: 'from-cyan-400 to-blue-600 text-white', icon: 'text-cyan-600', bar: 'bg-cyan-500', iconName: 'gem' },
};

const PROJECT_STATUS = {
  COUNTED: { label: 'Được cộng điểm', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  PENDING: { label: 'Chờ đánh giá', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  NOT_PASSED: { label: 'Chưa đạt', cls: 'bg-red-50 text-red-700 ring-red-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
};

const style = (key) => TIER_STYLE[key] || TIER_STYLE.newbie;

// Nhãn hạng gọn (thẻ ứng viên, tiêu đề hồ sơ). onDark: đặt trên nền xanh thương hiệu
export function RankBadge({ rank, onDark = false, className = '' }) {
  if (!rank?.tier) return null;
  const st = style(rank.tier.key);
  return (
    <span
      title={rank.completed_projects === undefined ? `Hạng ${rank.tier.name}` : `${rank.tier.name} · ${rank.joined_projects || 0} dự án tham gia, ${rank.completed_projects || 0} hoàn thành${rank.avg_score ? ` · điểm TB ${rank.avg_score}/10 (${rank.grade})` : ''} · ${rank.points || 0} điểm`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap ${
        onDark ? 'bg-white text-slate-800 ring-white/60 shadow' : st.pill
      } ${className}`}
    >
      <Icon name={st.iconName} className={`w-3.5 h-3.5 ${onDark ? st.icon : ''}`} />{rank.tier.name}
    </span>
  );
}

// Huy hiệu tròn nhỏ của hạng, đặt ở góc ảnh đại diện (diễn đàn, khung thông tin thành viên). Kích thước chỉnh qua className (vd. w-6 h-6)
export function RankMedal({ tierKey, name, className = 'w-6 h-6' }) {
  const st = style(tierKey);
  return (
    <span title={name ? `Hạng ${name}` : undefined} className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${st.solid} ring-2 ring-white shadow ${className}`}>
      <Icon name={st.iconName} className="w-[58%] h-[58%]" />
    </span>
  );
}

// Huy hiệu hạng trên thanh header (cạnh ảnh đại diện): chỉ hiện biểu tượng tròn với màu đặc trưng của hạng;
// rê chuột / focus vào mới hiện tên hạng và điểm tích lũy
export function RankHeaderPill({ rank, className = '' }) {
  if (!rank?.tier) return null;
  const st = style(rank.tier.key);
  return (
    <span className={`relative group inline-flex ${className}`}>
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${st.solid} shadow-sm ring-1 ring-black/5 group-hover:brightness-105 group-focus-within:ring-2 group-focus-within:ring-primary-300 transition`}>
        <Icon name={st.iconName} className="w-[18px] h-[18px]" />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full mt-2 z-50 whitespace-nowrap rounded-xl bg-white border border-slate-200 shadow-xl px-3.5 py-2 text-left opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition duration-150"
      >
        <span className="block text-sm font-bold text-slate-900">{rank.tier.name}</span>
        <span className="block text-xs text-slate-500">{rank.points || 0} điểm tích lũy</span>
      </span>
    </span>
  );
}

// Thẻ danh hiệu đầy đủ cho ứng viên: hạng hiện tại, tiến độ lên hạng, bậc thang các hạng và huy hiệu thành tích
export function RankCard({ rank, tiers = [] }) {
  if (!rank?.tier) return null;
  const st = style(rank.tier.key);
  const pts = rank.points || 0;

  return (
    <section className="card">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${st.grad} text-white flex items-center justify-center shadow-lift flex-shrink-0 mx-auto sm:mx-0`}>
          <Icon name={st.iconName} className="w-10 h-10" strokeWidth={1.6} />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Danh hiệu của bạn</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{rank.tier.name}</h2>
          <div className="mt-2 grid grid-cols-3 gap-2 max-w-md mx-auto sm:mx-0">
            {[
              { v: rank.joined_projects, l: 'Dự án tham gia' },
              { v: rank.completed_projects, l: 'Đã hoàn thành' },
              { v: rank.avg_score !== null ? `${rank.avg_score}/10` : '—', l: rank.grade ? `Điểm TB · ${rank.grade}` : 'Điểm trung bình' },
            ].map((x) => (
              <div key={x.l} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-center">
                <p className="text-lg font-extrabold text-slate-900 leading-none">{x.v}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">{x.l}</p>
              </div>
            ))}
          </div>
          {(rank.pending_review > 0 || rank.not_passed > 0) && (
            <p className="text-xs text-slate-400 mt-1.5">
              {rank.pending_review > 0 && <>{rank.pending_review} dự án đang chờ đánh giá</>}
              {rank.pending_review > 0 && rank.not_passed > 0 && ' · '}
              {rank.not_passed > 0 && <>{rank.not_passed} dự án chưa đạt điểm tối thiểu</>}
            </p>
          )}
          {rank.next ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                <span>Cần thêm <strong className="text-slate-700">{rank.next.need}</strong> điểm để lên hạng <strong className="text-slate-700">{rank.next.name}</strong></span>
                <span><strong className="text-slate-700">{pts}</strong>/{rank.next.target} điểm</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={rank.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${Math.max(rank.progress, 4)}%` }} />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-primary-700">Bạn đã đạt hạng cao nhất. Cảm ơn những đóng góp của bạn!</p>
          )}
        </div>
      </div>

      {/* Bậc thang các hạng */}
      {tiers.length > 0 && (
        <ol className="mt-5 grid grid-cols-5 gap-2" aria-label="Các hạng danh hiệu">
          {tiers.map((t, i) => {
            const reached = i <= rank.tier.level;
            const ts = style(t.key);
            return (
              <li key={t.key} className="text-center" title={t.desc}>
                <span className={`mx-auto w-9 h-9 rounded-full flex items-center justify-center ${reached ? `bg-gradient-to-br ${ts.grad} text-white shadow` : 'bg-slate-100 text-slate-300'} ${i === rank.tier.level ? 'ring-2 ring-offset-2 ring-primary-400' : ''}`}>
                  <Icon name={ts.iconName} className="w-[18px] h-[18px]" />
                </span>
                <p className={`mt-1.5 text-[11px] font-semibold leading-tight ${reached ? 'text-slate-700' : 'text-slate-400'}`}>{t.name}</p>
                <p className="text-[10px] text-slate-400">{t.min === 0 ? 'Mới' : `${t.min} điểm`}</p>
              </li>
            );
          })}
        </ol>
      )}

      {/* Từng dự án: điểm đánh giá và có được tính vào hạng không */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <p className="text-sm font-semibold text-slate-800">Dự án của bạn</p>
          <p className="text-xs text-slate-500">Mỗi dự án hoàn thành và được chấm từ {rank.qualify_score}/10 trở lên được cộng đúng số điểm đó vào điểm tích lũy</p>
        </div>
        {rank.projects?.length > 0 ? (
          <ul className="space-y-2">
            {rank.projects.map((p, i) => {
              const m = PROJECT_STATUS[p.status];
              return (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900 truncate">{p.project_name}</span>
                    {p.position && <span className="block text-xs text-slate-500 truncate">{p.position}</span>}
                  </span>
                  {p.score !== null && (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-800"><Icon name="star" className="w-4 h-4 text-amber-500" />{p.score.toFixed(1)}<span className="text-xs font-medium text-slate-400">/10</span></span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ring-1 ring-inset whitespace-nowrap ${m.cls}`}>{m.label}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Bạn chưa tham gia dự án DevHub nào. Hãy ứng tuyển một dự án thời vụ để bắt đầu tích lũy hạng.</p>
        )}
      </div>
    </section>
  );
}
