import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/adminApi';
import Avatar from '@/components/common/Avatar';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import MoneyInput from '@/components/common/MoneyInput';
import PageBanner from '@/components/common/PageBanner';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import { VIETQR_BANKS, resolveVietQrBank, buildVietQrUrl, buildTransferContent } from '@/utils/vietqr';

// Thanh toán thù lao: đóng dự án xong thì admin vào đây, kiểm tra số tiền (có sẵn theo thù lao vị trí, sửa được),
// quét QR chuyển khoản bằng điện thoại rồi bấm "Đã chuyển khoản xong". Chỉ có 2 trạng thái: chưa thanh toán / đã thanh toán.

const MIN_AMOUNT = 1000; // đồng; mọi số nguyên từ mức này trở lên đều hợp lệ (ngân hàng chuyển được là nhập được)
const formatMoney = (n) => `${new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0))}đ`;
const copyText = (text, label) => {
  if (!text) return;
  navigator.clipboard?.writeText(String(text)).then(() => toast.success(`Đã sao chép ${label}`), () => toast.error('Không sao chép được'));
};

// Chuẩn hóa một thành viên dự án thành một dòng thanh toán
const toRow = (m) => {
  const pay = m.Payments?.[0] || null;
  const ws = m.Workspace;
  return {
    m,
    pay,
    user: m.CandidateProfile?.User,
    avatar: m.CandidateProfile?.avatar_url,
    bank: m.CandidateProfile?.PaymentInformation,
    position: m.ProjectJob?.title || 'Thành viên dự án',
    amount: pay ? Math.round(Number(pay.amount)) : Math.round(Number(m.ProjectJob?.budget) || 0), // chưa có khoản thì lấy thù lao vị trí làm số tiền mặc định
    paid: pay?.status === 'PAID',
    hasPay: !!pay,
    wsId: ws?.id,
    project: ws?.Project?.name || ws?.InternalProject?.name || ws?.name || '—',
    closed: (ws?.Project?.status || ws?.InternalProject?.status) === 'COMPLETED',
  };
};

const Chip = ({ paid }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${paid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'}`}>
    <Icon name={paid ? 'check' : 'clock'} className="w-3.5 h-3.5" strokeWidth={2.2} />{paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
  </span>
);

// Số tiền: bấm vào để sửa ngay tại chỗ (chỉ khi chưa thanh toán)
function AmountCell({ row, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  if (row.paid) return <span className="font-extrabold text-gray-900">{formatMoney(row.amount)}</span>;
  if (!editing) {
    return (
      <div>
        <button type="button" onClick={() => { setValue(row.amount ? String(row.amount) : ''); setEditing(true); }} title="Sửa số tiền" aria-label={`Sửa số tiền${row.amount ? `, hiện là ${formatMoney(row.amount)}` : ''}`}
          className="group inline-flex items-center gap-1.5 font-extrabold text-gray-900 hover:text-primary-700 transition-colors">
          {row.amount ? formatMoney(row.amount) : <span className="text-sm font-semibold text-amber-600">Nhập số tiền</span>}
          <Icon name="pencil" className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-600" />
        </button>
        {!row.hasPay && row.amount > 0 && <p className="text-[0.6875rem] text-gray-400 leading-none mt-0.5">theo thù lao vị trí</p>}
      </div>
    );
  }
  const n = Math.round(Number(value) || 0);
  const submit = async (e) => { e.preventDefault(); if (n >= MIN_AMOUNT && (await onSave(n))) setEditing(false); };
  return (
    <form onSubmit={submit} onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }} className="relative flex items-center gap-1">
      <MoneyInput autoFocus value={value} onChange={setValue} aria-label="Số tiền" aria-invalid={n > 0 && n < MIN_AMOUNT}
        className="input-field !py-1 !px-2 w-32 text-sm font-bold" />
      <button type="submit" disabled={n < MIN_AMOUNT || saving} aria-label="Lưu số tiền" title={n < MIN_AMOUNT ? 'Số tiền tối thiểu 1.000đ' : 'Lưu'} className="w-8 h-8 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"><Icon name="check" className="w-4 h-4" strokeWidth={2.4} /></button>
      <button type="button" onClick={() => setEditing(false)} aria-label="Hủy" title="Hủy" className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center"><Icon name="x" className="w-4 h-4" /></button>
      {n > 0 && n < MIN_AMOUNT && <span role="alert" className="absolute mt-14 text-[0.6875rem] font-semibold text-red-600">Tối thiểu 1.000đ</span>}
    </form>
  );
}

const InfoLine = ({ label, value, copyLabel }) => (
  <div className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
    <span className="w-28 flex-shrink-0 text-xs text-gray-500">{label}</span>
    <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900 break-words">{value || '—'}</span>
    {copyLabel && value && (
      <button type="button" onClick={() => copyText(value, copyLabel)} aria-label={`Sao chép ${copyLabel}`} title={`Sao chép ${copyLabel}`}
        className="w-8 h-8 rounded-lg text-gray-400 hover:text-primary-700 hover:bg-primary-50 flex items-center justify-center flex-shrink-0"><Icon name="copy" className="w-4 h-4" /></button>
    )}
  </div>
);

// Giá trị trễ: chỉ đổi sau khi người dùng ngừng gõ một lúc (tránh gọi dịch vụ tạo mã QR cho từng chữ số, dễ bị chặn vì gọi quá nhiều)
function useDebounced(value, ms = 600) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

// Hộp thoại chuyển khoản: thông tin người nhận + mã QR; sửa được số tiền; xong thì bấm "Đã chuyển khoản xong"
function PayModal({ row, onClose, onPaid, pending }) {
  useEscapeKey(onClose);
  const [amount, setAmount] = useState(row.amount ? String(row.amount) : '');
  const [bankCode, setBankCode] = useState('');
  const { bank } = row;
  const bankName = bankCode || bank?.bank_name || '';
  const detected = resolveVietQrBank(bankName);
  const n = Math.round(Number(amount) || 0);
  const nQr = useDebounced(n); // mã QR cập nhật sau khi ngừng gõ ~0,6 giây
  const settling = n !== nQr;
  const content = buildTransferContent({ id: row.pay?.id || row.m.id, WorkspaceMember: { CandidateProfile: row.m.CandidateProfile } });
  const qr = bank?.account_number && detected && nQr >= MIN_AMOUNT
    ? buildVietQrUrl({ bankName, accountNumber: bank.account_number, accountHolderName: bank.account_holder_name, amount: nQr, description: content })
    : null;
  // Kết quả tải ảnh QR gắn với đúng địa chỉ ảnh đã yêu cầu: đổi số tiền/Thử lại thì tự về "đang tải", không dính kết quả cũ
  const [retry, setRetry] = useState(0);
  const qrKey = `${qr}|${retry}`;
  const [qrRes, setQrRes] = useState({ key: null, status: 'loading' });
  const qrState = qrRes.key === qrKey ? qrRes.status : 'loading'; // loading | ready | error
  const qrLoading = settling || qrState === 'loading';
  const qrFailed = !settling && qrState === 'error';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="Chuyển khoản thù lao">
      <div className="bg-white w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Avatar name={row.user?.full_name} src={row.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900 leading-tight">Chuyển khoản thù lao cho {row.user?.full_name}</h2>
            <p className="text-xs text-gray-500 truncate">{row.position} · {row.project}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center"><Icon name="x" className="w-5 h-5" /></button>
        </div>

        <div className="p-5 grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
          {/* Mã QR */}
          <div className="flex flex-col items-center">
            {qr ? (
              <div className="relative w-60 min-h-[15rem] rounded-xl border border-gray-200 bg-white overflow-hidden">
                <img key={qrKey} src={retry ? `${qr}&r=${retry}` : qr} alt={`Mã QR chuyển khoản ${formatMoney(nQr)}`}
                  onLoad={() => setQrRes({ key: qrKey, status: 'ready' })} onError={() => setQrRes({ key: qrKey, status: 'error' })}
                  className={`w-60 h-auto transition-opacity ${qrState === 'ready' && !settling ? 'opacity-100' : 'opacity-30'}`} />
                {qrLoading && (
                  <div className="absolute inset-0 flex items-center justify-center" role="status" aria-label="Đang tạo mã QR">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-600 shadow">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />Đang tạo mã QR...
                    </span>
                  </div>
                )}
                {qrFailed && (
                  <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <IconBadge name="alert" tone="amber" />
                    <p className="text-sm font-semibold text-gray-800">Chưa tải được mã QR</p>
                    <p className="text-xs text-gray-500">Dịch vụ tạo mã đang bận hoặc mạng chậm. Thử lại sau vài giây, hoặc chuyển khoản theo thông tin bên cạnh.</p>
                    <button type="button" onClick={() => setRetry((r) => r + 1)} className="btn-secondary text-xs !py-1.5">Thử lại</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-60 min-h-[15rem] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 flex flex-col items-center justify-center text-center gap-2 text-sm text-gray-500">
                <IconBadge name="card" tone="amber" />
                {!bank?.account_number ? <p>Ứng viên chưa cập nhật tài khoản ngân hàng nên chưa có mã QR.</p>
                  : !detected ? <p>Chưa nhận ra ngân hàng "{bank.bank_name}". Hãy chọn ngân hàng bên phải.</p>
                    : <p>Nhập số tiền từ 1.000đ để tạo mã QR.</p>}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-400 text-center">Mở app ngân hàng, quét mã, kiểm tra số tiền rồi chuyển.</p>
          </div>

          {/* Thông tin + số tiền */}
          <div className="min-w-0">
            <label htmlFor="pay-amount" className="block text-xs font-semibold text-gray-500 mb-1">Số tiền chuyển (sửa được)</label>
            <div className="relative">
              <MoneyInput id="pay-amount" value={amount} onChange={setAmount} aria-invalid={n > 0 && n < MIN_AMOUNT} aria-describedby="pay-amount-hint"
                className="input-field !py-2.5 !pr-10 text-xl font-extrabold text-primary-700" placeholder="Nhập số tiền" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">đ</span>
            </div>
            <p id="pay-amount-hint" className={`mt-1 text-xs ${n > 0 && n < MIN_AMOUNT ? 'font-semibold text-red-600' : 'text-gray-400'}`} role={n > 0 && n < MIN_AMOUNT ? 'alert' : undefined}>
              {n > 0 && n < MIN_AMOUNT ? 'Số tiền tối thiểu 1.000đ.' : 'Chỉ nhập chữ số, số nào ngân hàng chuyển được đều nhập được.'}
            </p>
            {row.pay === null && row.amount > 0 && Number(amount) === row.amount && <p className="mt-1 text-xs text-gray-400">Số tiền mặc định theo thù lao của vị trí.</p>}

            <div className="mt-3">
              <InfoLine label="Người nhận" value={bank?.account_holder_name || row.user?.full_name} />
              <InfoLine label="Ngân hàng" value={detected ? detected.shortName : bank?.bank_name} />
              <InfoLine label="Số tài khoản" value={bank?.account_number} copyLabel="số tài khoản" />
              <InfoLine label="Nội dung" value={content} copyLabel="nội dung chuyển khoản" />
            </div>

            {bank?.account_number && !detected && (
              <select className="input-field mt-2 text-sm" value={bankCode} onChange={(e) => setBankCode(e.target.value)} aria-label="Chọn ngân hàng để tạo mã QR">
                <option value="">Chọn ngân hàng để tạo mã QR...</option>
                {VIETQR_BANKS.map((b) => <option key={b.code} value={b.code}>{b.shortName}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Đóng</button>
          <button type="button" onClick={() => onPaid(n)} disabled={n < MIN_AMOUNT || pending} className="btn-primary text-sm !bg-none !bg-emerald-600 hover:!bg-emerald-700">
            <Icon name="check" className="w-4 h-4" strokeWidth={2.4} />{pending ? 'Đang lưu...' : `Đã chuyển khoản xong (${formatMoney(n)})`}
          </button>
        </div>
      </div>
    </div>
  );
}

const TABS = [{ v: 'UNPAID', l: 'Chưa thanh toán' }, { v: 'PAID', l: 'Đã thanh toán' }, { v: 'ALL', l: 'Tất cả' }];

export default function PaymentsPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [params] = useSearchParams();
  const [tab, setTab] = useState('UNPAID');
  const [projectFilter, setProjectFilter] = useState(params.get('project') || ''); // mở từ nút "Đóng dự án" thì vào thẳng dự án đó
  const [showOpen, setShowOpen] = useState(false); // mặc định chỉ hiện dự án đã đóng (đến lúc thanh toán)
  const [search, setSearch] = useState('');
  const [payTarget, setPayTarget] = useState(null);

  const { data: members, isLoading } = useQuery({ queryKey: ['admin-payable-members'], queryFn: () => adminApi.getPayableMembers().then((r) => r.data.data) });
  const rows = useMemo(() => (members || []).map(toRow), [members]);

  const refresh = () => qc.invalidateQueries({ predicate: (q) => /payment|payable|project|stats|dashboard/i.test(String(q.queryKey[0])) });
  const fail = (fallback) => (e) => toast.error(e.response?.data?.message || fallback);

  // Khoản chưa có thì tạo (số tiền mặc định lấy từ thù lao vị trí), có rồi thì sửa
  const saveAmount = useMutation({
    mutationFn: ({ row, amount }) => (row.pay ? adminApi.updatePayment(row.pay.id, { amount }) : adminApi.createPayment({ workspace_member_id: row.m.id, amount })),
    onSuccess: () => { refresh(); toast.success('Đã lưu số tiền'); },
    onError: fail('Chưa lưu được số tiền'),
  });
  const markPaid = useMutation({
    mutationFn: async ({ row, amount }) => {
      let pay = row.pay;
      if (!pay) pay = (await adminApi.createPayment({ workspace_member_id: row.m.id, amount })).data.data;
      return adminApi.processPayment(pay.id, { status: 'PAID', amount });
    },
    onSuccess: (_, { row }) => { refresh(); setPayTarget(null); toast.success(`Đã đánh dấu đã thanh toán cho ${row.user?.full_name || 'thành viên'}`); },
    onError: fail('Chưa đánh dấu được'),
  });
  const undo = useMutation({
    mutationFn: ({ row }) => adminApi.processPayment(row.pay.id, { status: 'PENDING' }),
    onSuccess: () => { refresh(); toast.success('Đã chuyển về chưa thanh toán'); },
    onError: fail('Chưa hoàn tác được'),
  });

  const onUndo = async (row) => {
    const ok = await confirm({ title: 'Hoàn tác thanh toán', message: `Chuyển khoản ${formatMoney(row.amount)} của ${row.user?.full_name} về "Chưa thanh toán"? Dùng khi bạn lỡ đánh dấu nhầm.`, confirmText: 'Hoàn tác', tone: 'danger' });
    if (ok) undo.mutate({ row });
  };

  if (isLoading) return <LoadingSpinner />;

  // Phạm vi hiển thị: chỉ dự án đã đóng; bật "hiện cả dự án chưa đóng" hoặc chọn đích danh một dự án thì hiện hết
  const inScope = rows.filter((r) => (projectFilter ? r.wsId === projectFilter : (showOpen || r.closed)));
  const hiddenProjects = !projectFilter && !showOpen ? new Set(rows.filter((r) => !r.closed).map((r) => r.wsId)).size : 0;
  const unpaid = inScope.filter((r) => !r.paid);
  const paid = inScope.filter((r) => r.paid);
  const sum = (list) => list.reduce((s, r) => s + r.amount, 0);

  const q = search.trim().toLowerCase();
  const visible = inScope.filter((r) => {
    if (tab === 'UNPAID' && r.paid) return false;
    if (tab === 'PAID' && !r.paid) return false;
    if (!q) return true;
    return [r.user?.full_name, r.user?.email, r.position, r.project].some((t) => t?.toLowerCase().includes(q));
  });

  const groups = (() => {
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.wsId)) map.set(r.wsId, { id: r.wsId, name: r.project, closed: r.closed, all: [], rows: [] });
      map.get(r.wsId).all.push(r);
    }
    for (const r of visible) map.get(r.wsId)?.rows.push(r);
    return [...map.values()].filter((g) => g.rows.length).sort((a, b) => Number(a.all.every((r) => r.paid)) - Number(b.all.every((r) => r.paid)));
  })();
  const projectOptions = (() => { const m = new Map(); rows.forEach((r) => m.set(r.wsId, r.project)); return [...m].map(([id, name]) => ({ id, name })); })();

  return (
    <div className="space-y-5">
      <PageBanner compact icon="card" title="Thanh toán thù lao" subtitle="Kiểm tra số tiền, quét mã QR để chuyển khoản, rồi bấm đã thanh toán." />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card !p-4 flex items-center gap-4 border-amber-100 bg-amber-50/60">
          <span className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0"><Icon name="clock" className="w-6 h-6" /></span>
          <div><p className="text-xs font-semibold text-amber-700">Chưa thanh toán</p><p className="text-xl font-extrabold text-gray-900 leading-tight">{formatMoney(sum(unpaid))}</p><p className="text-xs text-gray-500">{unpaid.length} người</p></div>
        </div>
        <div className="card !p-4 flex items-center gap-4 border-emerald-100 bg-emerald-50/60">
          <span className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0"><Icon name="check" className="w-6 h-6" strokeWidth={2.2} /></span>
          <div><p className="text-xs font-semibold text-emerald-700">Đã thanh toán</p><p className="text-xl font-extrabold text-gray-900 leading-tight">{formatMoney(sum(paid))}</p><p className="text-xs text-gray-500">{paid.length} người</p></div>
        </div>
      </div>

      <div className="card !p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          {TABS.map((t) => {
            const count = t.v === 'UNPAID' ? unpaid.length : t.v === 'PAID' ? paid.length : inScope.length;
            return (
              <button key={t.v} type="button" role="tab" aria-selected={tab === t.v} onClick={() => setTab(t.v)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${tab === t.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'}`}>
                {t.l} <span className={tab === t.v ? 'text-white/80' : 'text-gray-400'}>{count}</span>
              </button>
            );
          })}
          <div className="ml-auto flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select className="input-field !py-2 text-sm lg:w-56" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} aria-label="Lọc theo dự án">
              <option value="">Tất cả dự án</option>
              {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="relative flex-1 lg:w-56">
              <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className="input-field !py-2 !pl-9 text-sm" placeholder="Tìm ứng viên, vị trí..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        {!projectFilter && (
          <label className="inline-flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input type="checkbox" checked={showOpen} onChange={(e) => setShowOpen(e.target.checked)} className="accent-primary-600" />
            Hiện cả dự án chưa đóng{hiddenProjects > 0 ? ` (đang ẩn ${hiddenProjects} dự án)` : ''}
          </label>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-14">
          <IconBadge name={tab === 'UNPAID' ? 'verified' : 'card'} tone={tab === 'UNPAID' ? 'green' : 'slate'} size="lg" className="mx-auto" />
          <p className="mt-3 font-semibold text-gray-800">{tab === 'UNPAID' ? 'Không còn khoản nào chưa thanh toán' : 'Chưa có khoản nào ở mục này'}</p>
          {hiddenProjects > 0 && <p className="text-sm text-gray-500 mt-1">Đang ẩn {hiddenProjects} dự án chưa đóng. Tick "Hiện cả dự án chưa đóng" nếu cần xem.</p>}
        </div>
      ) : groups.map((g) => {
        const paidCount = g.all.filter((r) => r.paid).length;
        const pct = Math.round((paidCount / g.all.length) * 100);
        const left = sum(g.all.filter((r) => !r.paid));
        return (
          <section key={g.id} className="card !p-0 overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 bg-gray-50/70 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <h2 className="font-bold text-gray-900 flex flex-wrap items-center gap-2">
                  {g.name}
                  <span className={`px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold ${g.closed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{g.closed ? 'Đã đóng dự án' : 'Chưa đóng dự án'}</span>
                </h2>
                <p className="text-sm text-gray-600">Đã thanh toán <strong className="text-emerald-700">{paidCount}/{g.all.length}</strong>{left > 0 && <> · còn lại <strong className="text-gray-900">{formatMoney(left)}</strong></>}</p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
            </div>

            <ul className="divide-y divide-gray-100">
              {g.rows.map((r) => (
                <li key={r.m.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 sm:px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1 basis-52">
                    <Avatar name={r.user?.full_name} src={r.avatar} size="md" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{r.user?.full_name || '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{r.position}</p>
                    </div>
                  </div>

                  <div className="w-40 flex-shrink-0 min-w-0 text-xs">
                    {r.bank?.account_number ? (
                      <button type="button" onClick={() => copyText(r.bank.account_number, 'số tài khoản')} title="Sao chép số tài khoản" className="text-left group">
                        <p className="font-semibold text-gray-700 truncate">{resolveVietQrBank(r.bank.bank_name)?.shortName || r.bank.bank_name}</p>
                        <p className="text-gray-500 group-hover:text-primary-700">{r.bank.account_number} <Icon name="copy" className="w-3 h-3 ml-0.5 opacity-60" /></p>
                      </button>
                    ) : <p className="text-amber-600 font-medium">Chưa có tài khoản</p>}
                  </div>

                  <div className="w-36 flex-shrink-0"><AmountCell row={r} saving={saveAmount.isPending} onSave={(amount) => saveAmount.mutateAsync({ row: r, amount }).then(() => true, () => false)} /></div>

                  <div className="w-36 flex-shrink-0 flex flex-col items-start gap-0.5">
                    <Chip paid={r.paid} />
                    {r.paid && r.pay?.paid_at && <span className="text-[0.6875rem] text-gray-400">{new Date(r.pay.paid_at).toLocaleDateString('vi-VN')}</span>}
                  </div>

                  <div className="w-32 flex-shrink-0 flex justify-end">
                    {r.paid ? (
                      <button type="button" onClick={() => onUndo(r)} disabled={undo.isPending} className="text-xs font-medium text-gray-400 hover:text-red-600 hover:underline">Hoàn tác</button>
                    ) : (
                      <button type="button" onClick={() => setPayTarget(r)} className="btn-primary text-sm !py-2 !px-3.5 whitespace-nowrap"><Icon name="card" className="w-4 h-4" />Thanh toán</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {payTarget && <PayModal row={payTarget} pending={markPaid.isPending} onClose={() => setPayTarget(null)} onPaid={(amount) => markPaid.mutate({ row: payTarget, amount })} />}
    </div>
  );
}
