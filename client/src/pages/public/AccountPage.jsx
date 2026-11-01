import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/authApi';
import AvatarUploader from '@/components/common/AvatarUploader';
import Icon, { IconBadge } from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';

const ROLE_LABELS = { ADMIN: 'Quản trị viên', EMPLOYER: 'Nhà tuyển dụng', CANDIDATE: 'Ứng viên' };
const apiError = (err, fallback) => err.response?.data?.message || fallback;

const labelCls = 'block text-sm font-medium text-slate-700 mb-1';
const hintCls = 'mt-1 text-xs text-slate-500';

// Trình duyệt + hệ điều hành đoán từ User-Agent để người dùng nhận ra thiết bị của mình
function describeDevice(ua = '') {
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome'
    : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Trình duyệt';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iOS/.test(ua) ? 'iOS'
    : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'thiết bị khác';
  const mobile = /Mobile|Android|iPhone/.test(ua);
  return { name: `${browser} trên ${os}`, icon: mobile ? 'phone' : 'laptop' };
}

function PasswordInput({ id, value, onChange, autoComplete, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        className="input-field pr-10"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        <Icon name="eye" className="w-5 h-5" />
      </button>
    </div>
  );
}

function PanelHeader({ title, desc }) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {desc && <p className="text-sm text-slate-500 mt-1">{desc}</p>}
    </div>
  );
}

// ─── Thông tin cá nhân ────────────────────────────────────────────────────────
function InfoPanel({ me, isCandidate, isEmployer }) {
  const { updateUser } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: '', phone: '', date_of_birth: '', gender: '', address: '' });

  useEffect(() => {
    if (!me) return;
    setForm({
      full_name: me.full_name || '', phone: me.phone || '', date_of_birth: me.date_of_birth || '',
      gender: me.gender || '', address: me.address || '',
    });
  }, [me]);

  const save = useMutation({
    mutationFn: () => authApi.updateProfile({ ...form, date_of_birth: form.date_of_birth || null, gender: form.gender || null }),
    onSuccess: ({ data }) => {
      updateUser(data.data);
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['candidate-profile'] });
      toast.success(data.message || 'Đã cập nhật thông tin');
    },
    onError: (err) => toast.error(apiError(err, 'Chưa lưu được thông tin')),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <PanelHeader title="Thông tin cá nhân" desc={`Thông tin này dùng cho tài khoản của bạn trên DevHub.${isEmployer ? ' Ảnh đại diện của nhà tuyển dụng cũng là logo công ty.' : ''}`} />
      <div className="space-y-5 max-w-xl">
        <div>
          <label htmlFor="acc-name" className={labelCls}>Họ và tên <span className="text-red-500">*</span></label>
          <input id="acc-name" className="input-field" value={form.full_name} onChange={set('full_name')} maxLength={150} required />
        </div>
        <div>
          <label htmlFor="acc-email" className={labelCls}>Email đăng nhập</label>
          <input id="acc-email" className="input-field bg-slate-50 text-slate-500 cursor-not-allowed" value={me?.email || ''} readOnly />
          <p className={hintCls}>Email dùng để đăng nhập và nhận thông báo nên không thể thay đổi.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="acc-phone" className={labelCls}>Số điện thoại</label>
            <input id="acc-phone" className="input-field" type="tel" inputMode="tel" placeholder="09xx xxx xxx" value={form.phone} onChange={set('phone')} maxLength={20} />
          </div>
          <div>
            <label htmlFor="acc-dob" className={labelCls}>Ngày sinh</label>
            <input id="acc-dob" className="input-field" type="date" max={today} min="1920-01-01" value={form.date_of_birth} onChange={set('date_of_birth')} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="acc-gender" className={labelCls}>Giới tính</label>
            <select id="acc-gender" className="input-field" value={form.gender} onChange={set('gender')}>
              <option value="">Không muốn nêu</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Trạng thái tài khoản</label>
            <div className="input-field bg-slate-50 flex items-center gap-2 text-sm">
              <Icon name="verified" className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700">{me?.email_verified ? 'Email đã xác thực' : 'Chưa xác thực email'}</span>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="acc-address" className={labelCls}>Địa chỉ</label>
          <input id="acc-address" className="input-field" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố" value={form.address} onChange={set('address')} maxLength={255} />
          {isCandidate && <p className={hintCls}>Số điện thoại và địa chỉ được dùng chung với <Link to="/candidate/profile" className="text-primary-700 font-semibold hover:underline">hồ sơ năng lực</Link> của bạn.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" disabled={save.isPending} className="btn-primary">{save.isPending ? 'Đang lưu...' : 'Lưu thông tin'}</button>
          {isEmployer && <Link to="/employer/company" className="btn-secondary">Hồ sơ doanh nghiệp</Link>}
        </div>
      </div>
    </form>
  );
}

// ─── Đổi mật khẩu ─────────────────────────────────────────────────────────────
function PasswordPanel() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const rules = [
    { ok: f.next.length >= 8, text: 'Tối thiểu 8 ký tự' },
    { ok: /[A-Za-z]/.test(f.next) && /\d/.test(f.next), text: 'Gồm cả chữ và số (nên dùng thêm ký tự đặc biệt)' },
    { ok: !!f.next && f.next === f.confirm, text: 'Mật khẩu xác nhận khớp' },
  ];
  const change = useMutation({
    mutationFn: () => authApi.changePassword({ current_password: f.current, new_password: f.next }),
    onSuccess: ({ data }) => { toast.success(data.message || 'Đã đổi mật khẩu'); setF({ current: '', next: '', confirm: '' }); },
    onError: (err) => toast.error(apiError(err, 'Chưa đổi được mật khẩu')),
  });
  const submit = (e) => {
    e.preventDefault();
    if (f.next !== f.confirm) return toast.error('Mật khẩu xác nhận không khớp');
    change.mutate();
  };

  return (
    <form onSubmit={submit}>
      <PanelHeader title="Đổi mật khẩu" desc="Sau khi đổi, các thiết bị khác đang đăng nhập sẽ bị đăng xuất." />
      <div className="space-y-5 max-w-xl">
        <div>
          <label htmlFor="pw-current" className={labelCls}>Mật khẩu hiện tại</label>
          <PasswordInput id="pw-current" autoComplete="current-password" value={f.current} onChange={(v) => setF({ ...f, current: v })} />
          <p className={hintCls}>
            Đăng nhập bằng Google hoặc quên mật khẩu hiện tại? <Link to="/forgot-password" className="text-primary-700 font-semibold hover:underline">Đặt lại qua email</Link>.
          </p>
        </div>
        <div>
          <label htmlFor="pw-new" className={labelCls}>Mật khẩu mới</label>
          <PasswordInput id="pw-new" autoComplete="new-password" value={f.next} onChange={(v) => setF({ ...f, next: v })} />
        </div>
        <div>
          <label htmlFor="pw-confirm" className={labelCls}>Nhập lại mật khẩu mới</label>
          <PasswordInput id="pw-confirm" autoComplete="new-password" value={f.confirm} onChange={(v) => setF({ ...f, confirm: v })} />
        </div>
        <ul className="space-y-1.5 text-sm">
          {rules.map((r) => (
            <li key={r.text} className={`flex items-center gap-2 ${r.ok ? 'text-emerald-600' : 'text-slate-500'}`}>
              <Icon name={r.ok ? 'check' : 'info'} className="w-4 h-4 flex-shrink-0" />{r.text}
            </li>
          ))}
        </ul>
        <button type="submit" disabled={change.isPending || !f.current || !rules.every((r) => r.ok)} className="btn-primary">
          {change.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </form>
  );
}

// ─── Xác minh 2 bước ──────────────────────────────────────────────────────────
function TwoFactorPanel({ me }) {
  const { updateUser } = useAuth();
  const qc = useQueryClient();
  const enabled = !!me?.two_factor_enabled;
  const [step, setStep] = useState('idle'); // idle | code | disabling
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const done = (value) => {
    updateUser({ two_factor_enabled: value });
    qc.invalidateQueries({ queryKey: ['me'] });
    setStep('idle'); setCode(''); setPassword(''); setChallenge(null);
  };

  const send = useMutation({
    mutationFn: () => authApi.sendTwoFactorCode(),
    onSuccess: ({ data }) => { setChallenge(data.data.challenge); setStep('code'); setCode(''); setCooldown(60); toast.success(data.message); },
    onError: (err) => toast.error(apiError(err, 'Chưa gửi được mã')),
  });
  const enable = useMutation({
    mutationFn: () => authApi.enableTwoFactor(challenge, code),
    onSuccess: ({ data }) => { toast.success(data.message); done(true); },
    onError: (err) => { toast.error(apiError(err, 'Mã không đúng')); setCode(''); },
  });
  const disable = useMutation({
    mutationFn: () => authApi.disableTwoFactor(password),
    onSuccess: ({ data }) => { toast.success(data.message); done(false); },
    onError: (err) => toast.error(apiError(err, 'Chưa tắt được')),
  });

  return (
    <div>
      <PanelHeader title="Xác minh 2 bước" desc="Thêm một lớp bảo vệ: ngoài mật khẩu, bạn cần nhập mã 6 số gửi qua email mỗi lần đăng nhập." />
      <div className="max-w-xl space-y-5">
        <div className={`flex items-start gap-4 rounded-xl border p-4 ${enabled ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
          <IconBadge name="shield" tone={enabled ? 'green' : 'slate'} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{enabled ? 'Đã bật xác minh 2 bước' : 'Chưa bật xác minh 2 bước'}</p>
            <p className="text-sm text-slate-600 mt-0.5">
              {enabled ? <>Mã xác minh được gửi tới <strong className="break-all">{me?.email}</strong> khi bạn đăng nhập bằng email và mật khẩu.</>
                : 'Tài khoản đang chỉ được bảo vệ bằng mật khẩu. Nên bật để an toàn hơn, nhất là với tài khoản nhà tuyển dụng và quản trị viên.'}
            </p>
          </div>
        </div>

        {!enabled && step === 'idle' && (
          <button type="button" className="btn-primary" disabled={send.isPending} onClick={() => send.mutate()}>
            {send.isPending ? 'Đang gửi mã...' : 'Bật xác minh 2 bước'}
          </button>
        )}

        {!enabled && step === 'code' && (
          <form onSubmit={(e) => { e.preventDefault(); enable.mutate(); }} className="space-y-4">
            <div>
              <label htmlFor="tf-code" className={labelCls}>Nhập mã 6 số vừa gửi tới email của bạn</label>
              <input
                id="tf-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
                className="input-field max-w-[12rem] text-center text-xl font-bold tracking-[0.4em]" placeholder="······"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary" disabled={enable.isPending || code.length !== 6}>{enable.isPending ? 'Đang xác nhận...' : 'Xác nhận và bật'}</button>
              <button type="button" className="btn-secondary" disabled={cooldown > 0 || send.isPending} onClick={() => send.mutate()}>
                {cooldown > 0 ? `Gửi lại mã (${cooldown}s)` : 'Gửi lại mã'}
              </button>
              <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => setStep('idle')}>Hủy</button>
            </div>
          </form>
        )}

        {enabled && step === 'idle' && (
          <button type="button" className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50" onClick={() => setStep('disabling')}>Tắt xác minh 2 bước</button>
        )}
        {enabled && step === 'disabling' && (
          <form onSubmit={(e) => { e.preventDefault(); disable.mutate(); }} className="space-y-4">
            <div>
              <label htmlFor="tf-pw" className={labelCls}>Nhập mật khẩu để xác nhận tắt</label>
              <PasswordInput id="tf-pw" autoComplete="current-password" value={password} onChange={setPassword} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary" disabled={disable.isPending || !password}>{disable.isPending ? 'Đang tắt...' : 'Xác nhận tắt'}</button>
              <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => setStep('idle')}>Hủy</button>
            </div>
          </form>
        )}

        <p className="text-xs text-slate-500">Áp dụng khi đăng nhập bằng email và mật khẩu. Đăng nhập bằng Google dùng bảo mật của tài khoản Google.</p>
      </div>
    </div>
  );
}

// ─── Thiết bị đăng nhập ───────────────────────────────────────────────────────
function DevicesPanel() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const { data, isLoading } = useQuery({ queryKey: ['my-sessions'], queryFn: () => authApi.getSessions() });
  const sessions = data?.data?.data || [];
  const others = sessions.filter((s) => !s.current);

  const refresh = () => qc.invalidateQueries({ queryKey: ['my-sessions'] });
  const revoke = useMutation({
    mutationFn: (id) => authApi.revokeSession(id),
    onSuccess: ({ data: d }) => { toast.success(d.message); refresh(); },
    onError: (err) => toast.error(apiError(err, 'Chưa đăng xuất được thiết bị')),
  });
  const revokeAll = useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: ({ data: d }) => { toast.success(d.message); refresh(); },
    onError: (err) => toast.error(apiError(err, 'Chưa đăng xuất được')),
  });

  const onRevokeAll = async () => {
    if (await confirm({ title: 'Đăng xuất các thiết bị khác', message: `${others.length} thiết bị khác sẽ bị đăng xuất khỏi tài khoản này.`, confirmText: 'Đăng xuất' })) revokeAll.mutate();
  };

  return (
    <div>
      <PanelHeader title="Thiết bị đăng nhập" desc="Các thiết bị đang đăng nhập tài khoản của bạn. Thấy thiết bị lạ? Hãy đăng xuất nó và đổi mật khẩu ngay." />
      <div className="max-w-2xl space-y-3">
        {isLoading && <div className="skeleton h-16 rounded-xl" />}
        {sessions.map((s) => {
          const d = describeDevice(s.user_agent);
          return (
            <div key={s.id} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              <IconBadge name={d.icon} tone={s.current ? 'blue' : 'slate'} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                  {d.name}
                  {s.current && <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-bold ring-1 ring-inset ring-primary-200">Thiết bị này</span>}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Đăng nhập lúc {new Date(s.created_at).toLocaleString('vi-VN')}</p>
              </div>
              {!s.current && (
                <button type="button" className="btn-secondary text-sm !py-1.5" disabled={revoke.isPending} onClick={() => revoke.mutate(s.id)}>Đăng xuất</button>
              )}
            </div>
          );
        })}
        {others.length > 0 && (
          <button type="button" className="btn-secondary !text-red-600 !border-red-200 hover:!bg-red-50" disabled={revokeAll.isPending} onClick={onRevokeAll}>
            Đăng xuất tất cả thiết bị khác
          </button>
        )}
        {!isLoading && sessions.length > 0 && others.length === 0 && <p className="text-sm text-slate-500">Bạn chỉ đang đăng nhập trên thiết bị này.</p>}
      </div>
    </div>
  );
}

// ─── Trang tài khoản ──────────────────────────────────────────────────────────
export default function AccountPage() {
  const { user, getUserRoles, isEmployer, isAdmin, isCandidate } = useAuth();
  const [params, setParams] = useSearchParams();
  const roleList = getUserRoles().map((r) => ROLE_LABELS[r] || r);
  const dashboard = isAdmin() ? '/admin' : isEmployer() ? '/employer' : '/candidate';
  const candidate = isCandidate();

  const { data } = useQuery({ queryKey: ['me', user?.id], queryFn: () => authApi.getMe(), enabled: !!user });
  const me = data?.data?.data;

  const tabs = [
    { key: 'info', label: 'Thông tin cá nhân', icon: 'user' },
    { key: 'password', label: 'Đổi mật khẩu', icon: 'lock' },
    { key: 'twofa', label: 'Xác minh 2 bước', icon: 'shield', badge: me ? (me.two_factor_enabled ? 'Đã bật' : 'Chưa bật') : null },
    { key: 'devices', label: 'Thiết bị đăng nhập', icon: 'laptop' },
  ];
  const requested = params.get('tab');
  const active = tabs.some((t) => t.key === requested) ? requested : 'info';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 lg:grid-cols-[18.5rem_minmax(0,1fr)] items-start">
      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className="rounded-2xl bg-brand-gradient text-white p-5 shadow-lift">
          <div className="flex flex-col items-center text-center gap-4">
            <AvatarUploader size="2xl" light className="ring-4 ring-white/40" />
            <div className="min-w-0 w-full">
              <h1 className="font-bold text-xl leading-tight break-words">{user?.full_name}</h1>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {roleList.map((r) => (
                  <span key={r} className="px-3 py-1 rounded-full bg-white text-primary-700 text-xs font-bold shadow-sm">{r}</span>
                ))}
              </div>
              <p className="mt-2 text-sm text-white/85 break-all">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="card !p-2" aria-label="Cài đặt tài khoản">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setParams(t.key === 'info' ? {} : { tab: t.key }, { replace: true })}
              aria-current={active === t.key ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${
                active === t.key ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon name={t.icon} className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1 truncate">{t.label}</span>
              {t.badge && <span className={`text-[11px] font-bold ${me?.two_factor_enabled ? 'text-emerald-600' : 'text-slate-400'}`}>{t.badge}</span>}
            </button>
          ))}
          <Link to={dashboard} className="flex items-center gap-3 px-3 py-2.5 mt-1 border-t border-slate-100 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Icon name="home" className="w-[18px] h-[18px]" />Về Dashboard
          </Link>
        </nav>
      </aside>

      <section className="card !p-6 sm:!p-8 min-w-0">
        {active === 'info' && <InfoPanel me={me} isCandidate={candidate} isEmployer={isEmployer()} />}
        {active === 'password' && <PasswordPanel />}
        {active === 'twofa' && <TwoFactorPanel me={me} />}
        {active === 'devices' && <DevicesPanel />}
      </section>
    </div>
  );
}
