import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import PageBanner from '@/components/common/PageBanner';
import { VIETQR_BANKS, resolveVietQrBank, buildVietQrUrl, buildTransferContent } from '@/utils/vietqr';

const STATUS_LABELS = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-primary-100 text-primary-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
};

const METHOD_LABELS = {
  VIETQR: 'VietQR',
  BANK_TRANSFER: 'Chuyển khoản',
};

// Lưới cột cho danh sách giao dịch / thành viên: vừa khít chiều ngang, không phải cuộn; màn hình nhỏ thì xếp dọc
const TX_GRID = 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_7rem_8.5rem_10.5rem]';
const MEM_GRID = 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,11rem)_9rem_9.5rem]';

const formatCurrency = (n) =>
  n ? `${new Intl.NumberFormat('vi-VN').format(n)}đ` : '0đ';

const getProjectName = (ws) =>
  ws?.Project?.name || ws?.InternalProject?.name || ws?.name || '—';

const copyText = (text, label = 'thông tin') => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  toast.success(`Đã sao chép ${label}`);
};

export default function PaymentsPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();

  // Chế độ xem: 'projects' (Theo dự án) | 'transactions' (Giao dịch thanh toán) | 'members' (Theo dõi theo thành viên dự án)
  // Mở từ nút "Đóng dự án" / "Thanh toán thù lao" thì vào thẳng dự án đó: /admin/payments?view=projects&project=<workspaceId>
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(['projects', 'transactions', 'members'].includes(searchParams.get('view')) ? searchParams.get('view') : 'projects');

  // Bộ lọc chung
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || '');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal tạo thanh toán
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [createForm, setCreateForm] = useState({
    workspace_member_id: '',
    amount: '',
    payment_method: 'VIETQR',
  });

  // Modal sửa số tiền (chỉ cho PENDING / FAILED)
  const [editTarget, setEditTarget] = useState(null); // payment object
  const [editAmount, setEditAmount] = useState('');

  // Modal thanh toán & quét VietQR
  const [txModal, setTxModal] = useState(null);
  const [txCode, setTxCode] = useState('');
  const [overrideBankCode, setOverrideBankCode] = useState('');

  useEscapeKey(() => setTxModal(null), !!txModal);
  useEscapeKey(() => setShowCreate(false), showCreate);
  useEscapeKey(() => setEditTarget(null), !!editTarget);

  const { data: paymentsRes, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.getPayments(),
  });

  // Luôn lấy danh sách thành viên dự án để đối chiếu trạng thái thanh toán & ngăn tạo trùng
  const { data: membersRes, isLoading: membersLoading } = useQuery({
    queryKey: ['admin-payable-members'],
    queryFn: () => adminApi.getPayableMembers(),
  });

  const allPayments = paymentsRes?.data?.data || [];
  const payableMembers = membersRes?.data?.data || [];

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['admin-payments'] });
    qc.invalidateQueries({ queryKey: ['admin-payable-members'] });
  };

  // Danh sách các Workspace/Dự án
  const workspaceOptions = useMemo(() => {
    const map = new Map();
    for (const m of payableMembers) {
      const ws = m.Workspace;
      if (ws && !map.has(ws.id)) {
        map.set(ws.id, {
          id: ws.id,
          name: getProjectName(ws),
          wsName: ws.name,
          projectStatus: ws.Project?.status || ws.InternalProject?.status,
        });
      }
    }
    return Array.from(map.values());
  }, [payableMembers]);

  // Thành viên trong modal Tạo thanh toán (lọc theo dự án đã chọn)
  const modalMembers = useMemo(() => {
    if (!selectedWorkspaceId) return payableMembers;
    return payableMembers.filter((m) => m.Workspace?.id === selectedWorkspaceId);
  }, [payableMembers, selectedWorkspaceId]);

  // Số thành viên chưa có thanh toán hợp lệ
  const unpaidMembersCount = useMemo(
    () =>
      payableMembers.filter((m) => {
        const p = m.Payments?.[0];
        return !p || p.status === 'FAILED';
      }).length,
    [payableMembers]
  );

  const selectedMember = useMemo(
    () => payableMembers.find((m) => m.id === createForm.workspace_member_id) || null,
    [payableMembers, createForm.workspace_member_id]
  );

  const handleSelectMember = (memberId) => {
    const member = payableMembers.find((m) => m.id === memberId);
    const suggestedBudget = member?.ProjectJob?.budget
      ? String(Math.round(Number(member.ProjectJob.budget)))
      : '';
    setCreateForm((prev) => ({
      ...prev,
      workspace_member_id: memberId,
      amount: suggestedBudget || prev.amount,
    }));
  };

  const openCreateForMember = (member) => {
    setSelectedWorkspaceId(member.Workspace?.id || '');
    setCreateForm({
      workspace_member_id: member.id,
      amount: member.ProjectJob?.budget
        ? String(Math.round(Number(member.ProjectJob.budget)))
        : '',
      payment_method: 'VIETQR',
    });
    setShowCreate(true);
  };

  const processMutation = useMutation({
    mutationFn: ({ id, status, transaction_code, payment_method }) =>
      adminApi.processPayment(id, { status, transaction_code, payment_method }),
    onSuccess: () => {
      invalidateAll();
      toast.success('Đã cập nhật trạng thái thanh toán');
      setTxModal(null);
      setTxCode('');
      setOverrideBankCode('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => adminApi.createPayment(payload),
    onSuccess: (res) => {
      invalidateAll();
      toast.success(
        res.data?.restored
          ? 'Đã khôi phục yêu cầu thanh toán'
          : 'Đã tạo yêu cầu thanh toán mới'
      );
      setShowCreate(false);
      setCreateForm({ workspace_member_id: '', amount: '', payment_method: 'VIETQR' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể tạo thanh toán'),
  });

  const batchCreateMutation = useMutation({
    mutationFn: (workspaceId) => adminApi.createBatchProjectPayments(workspaceId),
    onSuccess: (res) => {
      invalidateAll();
      toast.success(`${res.data?.message || 'Đã tạo thanh toán theo dự án'} Khoản mới ở trạng thái chờ thanh toán: bấm "Thanh toán" ở từng thành viên để chuyển khoản và xác nhận.`, { duration: 7000 });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể tạo thanh toán hàng loạt'),
  });

  const updateAmountMutation = useMutation({
    mutationFn: ({ id, amount }) => adminApi.updatePayment(id, { amount }),
    onSuccess: () => {
      invalidateAll();
      toast.success('Đã cập nhật số tiền thanh toán');
      setEditTarget(null);
      setEditAmount('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể cập nhật số tiền'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deletePayment(id),
    onSuccess: () => {
      invalidateAll();
      toast.success('Đã hủy yêu cầu thanh toán');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể xóa khoản thanh toán'),
  });

  if (isLoading) return <LoadingSpinner />;

  // Lọc danh sách giao dịch
  const payments = allPayments.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (projectFilter && p.WorkspaceMember?.Workspace?.id !== projectFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const user = p.WorkspaceMember?.CandidateProfile?.User;
      const wsName = getProjectName(p.WorkspaceMember?.Workspace);
      const jobTitle = p.WorkspaceMember?.ProjectJob?.title || '';
      const tx = p.transaction_code || '';
      const match =
        user?.full_name?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q) ||
        wsName.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q) ||
        tx.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Lọc danh sách thành viên ở tab "Theo dõi theo thành viên"
  const filteredMemberRows = payableMembers.filter((m) => {
    if (projectFilter && m.Workspace?.id !== projectFilter) return false;
    const pStatus = m.Payments?.[0]?.status || 'UNCREATED';
    if (statusFilter) {
      if (statusFilter === 'UNCREATED' && pStatus !== 'UNCREATED') return false;
      if (statusFilter !== 'UNCREATED' && pStatus !== statusFilter) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const user = m.CandidateProfile?.User;
      const wsName = getProjectName(m.Workspace);
      const jobTitle = m.ProjectJob?.title || '';
      const match =
        user?.full_name?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q) ||
        wsName.toLowerCase().includes(q) ||
        jobTitle.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Gom thành viên theo dự án (Workspace): thống kê lấy trên TẤT CẢ thành viên của dự án, danh sách hiển thị theo bộ lọc
  const projectGroups = (() => {
    const visibleIds = new Set(filteredMemberRows.map((m) => m.id));
    const map = new Map();
    for (const m of payableMembers) {
      const ws = m.Workspace;
      if (!ws) continue;
      if (!map.has(ws.id)) map.set(ws.id, { id: ws.id, name: getProjectName(ws), status: ws.Project?.status || ws.InternalProject?.status, all: [], rows: [] });
      const g = map.get(ws.id);
      g.all.push(m);
      if (visibleIds.has(m.id)) g.rows.push(m);
    }
    const groups = Array.from(map.values())
      .filter((g) => (!projectFilter || g.id === projectFilter) && (g.rows.length > 0 || (!statusFilter && !searchTerm.trim())))
      .map((g) => {
        const pays = g.all.map((m) => m.Payments?.[0]).filter(Boolean);
        const paid = pays.filter((p) => p.status === 'PAID');
        return {
          ...g,
          paidCount: paid.length,
          waitingCount: pays.filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING').length,
          failedCount: pays.filter((p) => p.status === 'FAILED').length,
          noneCount: g.all.filter((m) => !m.Payments?.length).length,
          paidAmount: paid.reduce((s, p) => s + parseFloat(p.amount || 0), 0),
          totalAmount: pays.reduce((s, p) => s + parseFloat(p.amount || 0), 0),
        };
      });
    // Dự án còn khoản chưa trả lên trước, dự án đã trả đủ xuống sau
    return groups.sort((a, b) => Number(a.paidCount === a.all.length) - Number(b.paidCount === b.all.length));
  })();

  // Summary stats
  const totalPaid = allPayments
    .filter((p) => p.status === 'PAID')
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPendingAmount = allPayments
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPending = allPayments.filter((p) => p.status === 'PENDING').length;
  const totalProcessing = allPayments.filter((p) => p.status === 'PROCESSING').length;

  const openQrModal = (payment) => {
    setTxModal(payment);
    setTxCode(payment.transaction_code || '');
    setOverrideBankCode('');
  };

  // Tính toán thông tin VietQR cho modal đang mở
  const modalBankInfo = txModal?.WorkspaceMember?.CandidateProfile?.PaymentInformation;
  const effectiveBankName = overrideBankCode || modalBankInfo?.bank_name || '';
  const detectedBank = resolveVietQrBank(effectiveBankName);
  const transferContent = txModal ? buildTransferContent(txModal) : '';
  const qrImageUrl =
    txModal && modalBankInfo?.account_number
      ? buildVietQrUrl({
          bankName: effectiveBankName,
          accountNumber: modalBankInfo.account_number,
          accountHolderName: modalBankInfo.account_holder_name,
          amount: txModal.amount,
          description: transferContent,
        })
      : null;

  return (
    <div className="space-y-6">
      <PageBanner
        compact
        icon="card"
        title="Quản lý thanh toán thù lao"
        subtitle="Mỗi thành viên trong một dự án được quyết toán 1 lần duy nhất dựa trên tiến độ nghiệm thu công việc"
      >
        <button
          onClick={() => {
            setSelectedWorkspaceId(projectFilter || '');
            setCreateForm({ workspace_member_id: '', amount: '', payment_method: 'VIETQR' });
            setShowCreate(true);
          }}
          className="btn-light"
        >
          <Icon name="plus" className="w-4 h-4" /> Tạo thanh toán ({unpaidMembersCount} chưa tạo)
        </button>
      </PageBanner>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-emerald-50 border-emerald-100 border text-center py-3">
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Tổng đã giải ngân ({allPayments.filter((p) => p.status === 'PAID').length} thành viên)
          </p>
        </div>
        <div className="card bg-amber-50 border-amber-100 border text-center py-3">
          <p className="text-xl font-bold text-amber-700">{formatCurrency(totalPendingAmount)}</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Tổng chờ thanh toán ({totalPending + totalProcessing} khoản)
          </p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100 border text-center py-3">
          <p className="text-xl font-bold text-yellow-700">{unpaidMembersCount}</p>
          <p className="text-xs text-yellow-600 mt-0.5">Thành viên chưa khởi tạo TT</p>
        </div>
        <div className="card bg-primary-50 border-primary-100 border text-center py-3">
          <p className="text-xl font-bold text-primary-700">{payableMembers.length}</p>
          <p className="text-xs text-primary-700 mt-0.5">Tổng thành viên các dự án</p>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
          {/* Chuyển chế độ xem */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveView('projects')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'projects'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Theo dự án ({workspaceOptions.length})
            </button>
            <button
              onClick={() => {
                setActiveView('transactions');
                if (statusFilter === 'UNCREATED') setStatusFilter('');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'transactions'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Giao dịch thanh toán ({allPayments.length})
            </button>
            <button
              onClick={() => setActiveView('members')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'members'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Theo dõi theo Thành viên dự án ({payableMembers.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc theo dự án */}
            <select
              className="input-field py-1.5 text-xs w-full sm:w-56"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">Tất cả dự án ({workspaceOptions.length})</option>
              {workspaceOptions.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} {ws.projectStatus === 'COMPLETED' ? '(Đã nghiệm thu)' : ''}
                </option>
              ))}
            </select>

            {/* Nút khởi tạo hàng loạt cho dự án đang lọc */}
            {projectFilter && (
              <button
                type="button"
                onClick={async () => {
                  const wsObj = workspaceOptions.find((w) => w.id === projectFilter);
                  const ok = await confirm({
                    title: 'Khởi tạo thanh toán cho cả dự án',
                    message: `Tự động tạo yêu cầu thanh toán (theo mức thù lao vị trí) cho tất cả thành viên chưa có thanh toán trong dự án "${wsObj?.name || ''}"? Các thành viên đã thanh toán hoặc đang chờ xử lý sẽ được bỏ qua.`,
                    confirmText: 'Khởi tạo hàng loạt',
                    tone: 'primary',
                  });
                  if (ok) batchCreateMutation.mutate(projectFilter);
                }}
                disabled={batchCreateMutation.isPending}
                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold border border-primary-200 transition-colors"
              >
                + Tạo TT cho cả dự án này
              </button>
            )}

            {/* Tìm kiếm */}
            <div className="relative w-full sm:w-64">
              <Icon
                name="search"
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                className="input-field pl-9 py-1.5 text-xs"
                placeholder="Tìm ứng viên, vị trí, mã GD..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter pills theo trạng thái */}
        <div className="flex gap-2 flex-wrap">
          {(activeView === 'transactions'
            ? ['', 'PENDING', 'PROCESSING', 'PAID', 'FAILED']
            : ['', 'UNCREATED', 'PENDING', 'PROCESSING', 'PAID', 'FAILED']
          ).map((s) => {
            const count =
              activeView === 'transactions'
                ? s === ''
                  ? allPayments.length
                  : allPayments.filter((p) => p.status === s).length
                : s === ''
                ? payableMembers.length
                : s === 'UNCREATED'
                ? payableMembers.filter((m) => !m.Payments?.length).length
                : payableMembers.filter((m) => m.Payments?.[0]?.status === s).length;

            const label =
              s === ''
                ? `Tất cả (${count})`
                : s === 'UNCREATED'
                ? `Chưa tạo TT (${count})`
                : `${STATUS_LABELS[s]} (${count})`;

            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── VIEW 0: THANH TOÁN THEO DỰ ÁN — dự án nào, ứng viên nào đã được thanh toán chưa ─── */}
      {activeView === 'projects' && (
        <div className="space-y-4">
          {membersLoading && <div className="py-10 flex justify-center"><LoadingSpinner /></div>}
          {!membersLoading && projectGroups.length === 0 && (
            <div className="card text-center py-12 text-gray-400">Không có dự án nào phù hợp bộ lọc</div>
          )}
          {projectGroups.map((g) => {
            const pct = g.all.length ? Math.round((g.paidCount / g.all.length) * 100) : 0;
            const allPaid = g.all.length > 0 && g.paidCount === g.all.length;
            const needCreate = g.noneCount + g.failedCount;
            return (
              <section key={g.id} className="card !p-0 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base flex flex-wrap items-center gap-2">
                        {g.name}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${g.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {g.status === 'COMPLETED' ? 'Đã nghiệm thu' : 'Chưa đóng dự án'}
                        </span>
                        {allPaid && <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white">Đã thanh toán đủ</span>}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Đã thanh toán <strong className="text-emerald-700">{g.paidCount}/{g.all.length}</strong> thành viên
                        {g.waitingCount > 0 && <> · {g.waitingCount} đang chờ</>}
                        {g.failedCount > 0 && <> · <span className="text-red-600">{g.failedCount} thất bại</span></>}
                        {g.noneCount > 0 && <> · {g.noneCount} chưa tạo khoản TT</>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(g.paidAmount)} <span className="text-xs font-medium text-gray-400">/ {formatCurrency(g.totalAmount)}</span></p>
                      <p className="text-[11px] text-gray-400">đã trả / tổng thù lao</p>
                    </div>
                  </div>
                  {g.waitingCount > 0 && (
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      <Icon name="info" className="w-4 h-4 mt-px flex-shrink-0" />
                      <span>Khoản thù lao đã được tạo nhưng <strong>chưa chuyển tiền</strong>. Bấm <strong>Thanh toán</strong> ở từng thành viên, quét QR chuyển khoản rồi nhập mã giao dịch để xác nhận, lúc đó trạng thái mới chuyển sang Đã thanh toán.</span>
                    </p>
                  )}
                  <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
                  {needCreate > 0 && (
                    <button
                      type="button"
                      disabled={batchCreateMutation.isPending}
                      onClick={async () => {
                        const ok = await confirm({
                          title: 'Khởi tạo thanh toán cho cả dự án',
                          message: `Tự động tạo yêu cầu thanh toán (theo mức thù lao vị trí) cho ${needCreate} thành viên chưa có khoản thanh toán trong dự án "${g.name}"? Các thành viên đã thanh toán hoặc đang chờ xử lý sẽ được bỏ qua.`,
                          confirmText: 'Khởi tạo hàng loạt',
                          tone: 'primary',
                        });
                        if (ok) batchCreateMutation.mutate(g.id);
                      }}
                      className="mt-3 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-semibold border border-primary-200"
                    >
                      + Tạo thanh toán cho {needCreate} thành viên chưa có
                    </button>
                  )}
                </div>

                <ul className="divide-y divide-gray-100">
                  {g.rows.map((m) => {
                    const pay = m.Payments?.[0];
                    const user = m.CandidateProfile?.User;
                    const score = m.CandidateEvaluation?.score;
                    const amount = pay ? pay.amount : m.ProjectJob?.budget;
                    const full = pay ? allPayments.find((p) => p.id === pay.id) : null;
                    const st = pay ? pay.status : 'NONE';
                    return (
                      <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-5 py-3">
                        <div className="min-w-0 flex-1 basis-56">
                          <p className="font-semibold text-gray-900 truncate">{user?.full_name || '—'}</p>
                          <p className="text-xs text-gray-500 truncate">{m.ProjectJob?.title || 'Thành viên dự án'}</p>
                        </div>
                        <div className="text-xs text-gray-500 w-28">
                          <p>Công việc: <strong className="text-gray-700">{m.task_stats?.done_tasks || 0}/{m.task_stats?.total_tasks || 0}</strong></p>
                          <p>Điểm: <strong className="text-gray-700">{score !== undefined && score !== null ? `${parseFloat(score).toFixed(1)}/10` : 'Chưa chấm'}</strong></p>
                        </div>
                        <p className="w-32 text-sm font-bold text-gray-800 text-right">{formatCurrency(amount)}</p>
                        <div className="w-36 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${st === 'NONE' ? 'bg-gray-100 text-gray-600' : STATUS_COLORS[st]}`}>
                            {st === 'NONE' ? 'Chưa tạo thanh toán' : st === 'PENDING' ? 'Chờ thanh toán' : STATUS_LABELS[st]}
                          </span>
                          {st === 'PAID' && pay.paid_at && <p className="text-[11px] text-gray-400 mt-1">{new Date(pay.paid_at).toLocaleDateString('vi-VN')}</p>}
                        </div>
                        <div className="w-28 text-right">
                          {st === 'NONE' && (
                            <button onClick={() => openCreateForMember(m)} className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold">Tạo TT</button>
                          )}
                          {['PENDING', 'PROCESSING', 'FAILED'].includes(st) && full && (
                            <button onClick={() => openQrModal(full)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold">Thanh toán</button>
                          )}
                          {st === 'PAID' && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><Icon name="check" className="w-4 h-4" strokeWidth={2.5} />Hoàn tất</span>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* ─── VIEW 1: DANH SÁCH GIAO DỊCH THANH TOÁN ─── */}
      {activeView === 'transactions' && (
        <div className="card !p-0 overflow-hidden">
          <div className={`hidden lg:grid ${TX_GRID} gap-4 px-5 py-3 bg-gray-50 border-b text-xs font-semibold uppercase tracking-wide text-gray-500`}>
            <span>Ứng viên</span><span>Ngân hàng</span><span>Dự án & vị trí</span><span className="text-right">Số tiền</span><span>Trạng thái</span><span className="text-right">Thao tác</span>
          </div>
          {payments.length === 0 && (
            <p className="p-10 text-center text-sm text-gray-400">
              {statusFilter ? `Không có giao dịch ở trạng thái "${STATUS_LABELS[statusFilter]}"` : 'Chưa có giao dịch thanh toán nào'}
            </p>
          )}
          <ul className="divide-y divide-gray-100">
            {payments.map((p) => {
              const candidate = p.WorkspaceMember?.CandidateProfile;
              const bankInfo = candidate?.PaymentInformation;
              const user = candidate?.User;
              const projectName = getProjectName(p.WorkspaceMember?.Workspace);
              const job = p.WorkspaceMember?.ProjectJob;
              const evalInfo = p.WorkspaceMember?.CandidateEvaluation;
              const isEditable = p.status === 'PENDING' || p.status === 'FAILED';
              const busy = processMutation.isPending;

              return (
                <li key={p.id} className={`grid grid-cols-1 ${TX_GRID} gap-x-4 gap-y-2 px-5 py-4 items-center hover:bg-gray-50/60 transition-colors`}>
                  {/* Ứng viên */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || '—'}</p>
                    <p className="text-xs text-gray-500 break-all">{user?.email}</p>
                  </div>

                  {/* Ngân hàng */}
                  <div className="min-w-0 text-xs">
                    {bankInfo?.account_number ? (
                      <>
                        <p className="text-sm font-semibold text-gray-800 truncate">{bankInfo.bank_name}</p>
                        <p className="flex items-center gap-1.5 text-gray-500">
                          <span className="font-mono">{bankInfo.account_number}</span>
                          <button type="button" onClick={() => copyText(bankInfo.account_number, 'số tài khoản')} className="text-primary-700 hover:underline font-medium">Sao chép</button>
                        </p>
                        <p className="text-gray-400 uppercase truncate">{bankInfo.account_holder_name}</p>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 font-medium">
                        <Icon name="alert" className="w-3.5 h-3.5" /> Chưa có số tài khoản
                      </span>
                    )}
                  </div>

                  {/* Dự án & vị trí */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2" title={projectName}>{projectName}</p>
                    <p className="text-xs text-primary-700 line-clamp-2" title={job?.title}>{job?.title || 'Thành viên dự án'}</p>
                    {evalInfo && <p className="text-xs text-gray-500 mt-0.5">Đánh giá: <strong className="text-amber-600">{parseFloat(evalInfo.score).toFixed(1)}/10</strong></p>}
                  </div>

                  {/* Số tiền */}
                  <div className="flex items-center lg:justify-end gap-1">
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(p.amount)}</span>
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => { setEditTarget(p); setEditAmount(String(Math.round(Number(p.amount || 0)))); }}
                        title="Điều chỉnh số tiền"
                        className="text-gray-400 hover:text-primary-700 p-1 rounded hover:bg-gray-100"
                      >
                        <Icon name="pencil" className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Trạng thái (kèm mã giao dịch / ngày thanh toán) */}
                  <div className="min-w-0">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                    {p.paid_at && (
                      <p className="text-xs text-gray-500 mt-1">{new Date(p.paid_at).toLocaleDateString('vi-VN')} {new Date(p.paid_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                    {p.transaction_code && (
                      <p className="text-xs text-gray-400 truncate" title={p.transaction_code}>
                        <span className="font-mono">{p.transaction_code}</span>{p.payment_method ? ` · ${METHOD_LABELS[p.payment_method] || p.payment_method}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Thao tác */}
                  <div className="flex flex-wrap lg:justify-end items-center gap-x-2 gap-y-1.5">
                    {p.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400"><Icon name="lock" className="w-3.5 h-3.5" /> Đã tất toán</span>
                    ) : (
                      <>
                        {(p.status === 'PENDING' || p.status === 'PROCESSING' || p.status === 'FAILED') && (
                          <button
                            onClick={() => openQrModal(p)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold transition-colors shadow-sm whitespace-nowrap"
                          >
                            <Icon name="card" className="w-3.5 h-3.5" />{p.status === 'FAILED' ? 'Thanh toán lại' : 'Thanh toán QR'}
                          </button>
                        )}
                        {p.status === 'PENDING' && (
                          <button onClick={() => processMutation.mutate({ id: p.id, status: 'PROCESSING' })} disabled={busy} className="text-xs px-2 py-1.5 text-primary-700 hover:bg-primary-50 rounded-lg font-medium whitespace-nowrap">Đang xử lý</button>
                        )}
                        {p.status === 'PROCESSING' && (
                          <button onClick={() => processMutation.mutate({ id: p.id, status: 'FAILED' })} disabled={busy} className="text-xs px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium whitespace-nowrap">Báo lỗi</button>
                        )}
                        {isEditable && (
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await confirm({
                                title: 'Hủy yêu cầu thanh toán',
                                message: `Hủy yêu cầu thanh toán ${formatCurrency(p.amount)} của "${user?.full_name || ''}"? Sau khi hủy bạn có thể tạo lại nếu cần.`,
                                confirmText: 'Hủy thanh toán',
                                tone: 'danger',
                              });
                              if (ok) deleteMutation.mutate(p.id);
                            }}
                            disabled={deleteMutation.isPending}
                            title="Hủy yêu cầu thanh toán tạo nhầm"
                            aria-label="Hủy yêu cầu thanh toán"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ─── VIEW 2: THEO DÕI THÙ LAO THEO THÀNH VIÊN DỰ ÁN ─── */}
      {activeView === 'members' && (
        <div className="card !p-0 overflow-hidden">
          {membersLoading ? (
            <div className="py-10 flex justify-center"><LoadingSpinner /></div>
          ) : (
            <>
              <div className={`hidden lg:grid ${MEM_GRID} gap-4 px-5 py-3 bg-gray-50 border-b text-xs font-semibold uppercase tracking-wide text-gray-500`}>
                <span>Thành viên</span><span>Dự án & vị trí</span><span>Tiến độ</span><span className="text-right">Thù lao</span><span>Trạng thái</span><span className="text-right">Thao tác</span>
              </div>
              {filteredMemberRows.length === 0 && <p className="p-10 text-center text-sm text-gray-400">Không có thành viên nào khớp bộ lọc</p>}
              <ul className="divide-y divide-gray-100">
                {filteredMemberRows.map((m) => {
                  const user = m.CandidateProfile?.User;
                  const bankInfo = m.CandidateProfile?.PaymentInformation;
                  const projectName = getProjectName(m.Workspace);
                  const projStatus = m.Workspace?.Project?.status || m.Workspace?.InternalProject?.status;
                  const job = m.ProjectJob;
                  const payment = m.Payments?.[0] || null;
                  const ts = m.task_stats || { total_tasks: 0, done_tasks: 0 };
                  const allDone = ts.total_tasks > 0 && ts.done_tasks === ts.total_tasks;
                  const evalScore = m.CandidateEvaluation?.score;

                  return (
                    <li key={m.id} className={`grid grid-cols-1 ${MEM_GRID} gap-x-4 gap-y-2 px-5 py-4 items-center hover:bg-gray-50/60 transition-colors`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || '—'}</p>
                        <p className="text-xs text-gray-500 break-all">{user?.email}</p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2" title={projectName}>
                          {projectName}
                          {projStatus === 'COMPLETED' && <span className="ml-1.5 align-middle text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Đã nghiệm thu</span>}
                        </p>
                        <p className="text-xs text-primary-700 line-clamp-2">{job?.title || 'Thành viên dự án'}</p>
                      </div>

                      <div className="text-xs min-w-0">
                        {ts.total_tasks > 0 ? (
                          <>
                            <p className={`font-semibold ${allDone ? 'text-emerald-700' : 'text-amber-600'}`}>{ts.done_tasks}/{ts.total_tasks} công việc hoàn thành</p>
                            <div className="w-full max-w-[9rem] bg-gray-100 h-1.5 rounded-full mt-1">
                              <div className={`h-1.5 rounded-full ${allDone ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.round((ts.done_tasks / ts.total_tasks) * 100)}%` }} />
                            </div>
                          </>
                        ) : <p className="text-gray-400">Chưa giao công việc</p>}
                        {evalScore != null && <p className="text-gray-500 mt-1">Đánh giá: <strong className="text-amber-600">{parseFloat(evalScore).toFixed(1)}/10</strong></p>}
                      </div>

                      <div className="min-w-0 lg:text-right">
                        <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(payment ? payment.amount : job?.budget)}</p>
                        <p className="text-xs text-gray-500 break-words">
                          {bankInfo?.account_number ? `${bankInfo.bank_name} · ${bankInfo.account_number}` : <span className="text-amber-600 font-medium">Chưa có số tài khoản</span>}
                        </p>
                      </div>

                      <div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${payment ? (STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'}`}>
                          {payment ? (STATUS_LABELS[payment.status] || payment.status) : 'Chưa tạo thanh toán'}
                        </span>
                      </div>

                      <div className="lg:text-right">
                        {!payment ? (
                          <button type="button" onClick={() => openCreateForMember(m)} className="inline-flex items-center gap-1.5 text-xs px-3 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-semibold shadow-sm whitespace-nowrap">
                            <Icon name="plus" className="w-3.5 h-3.5" /> Khởi tạo TT
                          </button>
                        ) : payment.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium"><Icon name="lock" className="w-3.5 h-3.5" /> Đã tất toán</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { const full = allPayments.find((p) => p.id === payment.id); if (full) openQrModal(full); }}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-semibold shadow-sm whitespace-nowrap"
                          >
                            <Icon name="card" className="w-3.5 h-3.5" /> Thanh toán QR
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Modal Điều chỉnh số tiền (chỉ cho PENDING / FAILED) */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="font-bold text-lg text-gray-900 mb-1">Điều chỉnh số tiền thanh toán</h3>
            <p className="text-xs text-gray-500 mb-4">
              Ứng viên: <strong>{editTarget.WorkspaceMember?.CandidateProfile?.User?.full_name}</strong> ·{' '}
              {getProjectName(editTarget.WorkspaceMember?.Workspace)}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền mới (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                className="input-field"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
              {editAmount && (
                <p className="text-xs font-semibold text-primary-700 mt-1">
                  = {formatCurrency(editAmount)}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditTarget(null)} className="btn-secondary">
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!editAmount || Number(editAmount) < 1000) {
                    return toast.error('Số tiền phải từ 1.000đ trở lên');
                  }
                  updateAmountMutation.mutate({ id: editTarget.id, amount: Number(editAmount) });
                }}
                disabled={updateAmountMutation.isPending}
                className="btn-primary"
              >
                {updateAmountMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quét mã VietQR & Xác nhận chuyển khoản */}
      {txModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-fade-in">
            {/* Header */}
            <div className="bg-brand-gradient px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Icon name="card" className="w-5 h-5" />
                  Thanh toán thù lao & Quét mã VietQR
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Quét mã QR bằng ứng dụng Ngân hàng để chuyển khoản chính xác số tiền và nội dung
                </p>
              </div>
              <button
                onClick={() => setTxModal(null)}
                aria-label="Đóng"
                className="text-white/80 hover:text-white"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Cột trái: Mã VietQR */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                {qrImageUrl ? (
                  <>
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-3">
                      <img
                        src={qrImageUrl}
                        alt="VietQR"
                        className="w-56 h-auto rounded-lg object-contain mx-auto"
                      />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Icon name="verified" className="w-3.5 h-3.5" /> Mã VietQR tự động
                    </span>
                    <p className="text-[11px] text-gray-400 text-center mt-1.5">
                      Đã điền sẵn số tài khoản, số tiền & nội dung chuyển khoản
                    </p>
                  </>
                ) : modalBankInfo?.account_number ? (
                  <div className="text-center space-y-3 py-4 px-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                      <Icon name="alert" className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      Chưa nhận diện được mã ngân hàng "{modalBankInfo.bank_name}"
                    </p>
                    <p className="text-xs text-gray-500">
                      Chọn ngân hàng tương ứng bên dưới để tạo mã VietQR:
                    </p>
                    <select
                      className="input-field text-xs"
                      value={overrideBankCode}
                      onChange={(e) => setOverrideBankCode(e.target.value)}
                    >
                      <option value="">-- Chọn ngân hàng để tạo QR --</option>
                      {VIETQR_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.shortName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-8 px-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
                      <Icon name="alert" className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Chưa có thông tin ngân hàng</p>
                    <p className="text-xs text-gray-500">
                      Ứng viên chưa khai báo số tài khoản nhận thù lao trong hồ sơ cá nhân.
                    </p>
                  </div>
                )}
              </div>

              {/* Cột phải: Thông tin chi tiết & Xác nhận */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="bg-primary-50/60 border border-primary-100 rounded-xl p-3.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Người thụ hưởng (Ứng viên)</p>
                        <p className="font-bold text-gray-900">
                          {txModal.WorkspaceMember?.CandidateProfile?.User?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getProjectName(txModal.WorkspaceMember?.Workspace)}
                          {txModal.WorkspaceMember?.ProjectJob?.title
                            ? ` · ${txModal.WorkspaceMember.ProjectJob.title}`
                            : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Số tiền thanh toán</p>
                        <p className="text-lg font-extrabold text-primary-700">
                          {formatCurrency(txModal.amount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {modalBankInfo?.account_number && (
                    <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 text-xs">
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-gray-500">Ngân hàng:</span>
                        <span className="font-semibold text-gray-800">
                          {detectedBank ? detectedBank.shortName : modalBankInfo.bank_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-gray-500">Chủ tài khoản:</span>
                        <span className="font-semibold text-gray-800 uppercase">
                          {modalBankInfo.account_holder_name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-gray-500">Số tài khoản:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 text-sm">
                            {modalBankInfo.account_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(modalBankInfo.account_number, 'số tài khoản')}
                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-medium text-gray-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3.5 py-2">
                        <span className="text-gray-500">Nội dung CK:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-800">{transferContent}</span>
                          <button
                            type="button"
                            onClick={() => copyText(transferContent, 'nội dung chuyển khoản')}
                            className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[11px] font-medium text-gray-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Mã giao dịch ngân hàng (Transaction Code) <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setTxCode(
                            `FT${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${String(
                              txModal.id
                            )
                              .slice(0, 6)
                              .toUpperCase()}`
                          )
                        }
                        className="text-[11px] text-primary-700 hover:underline font-medium"
                      >
                        + Điền mã tham chiếu tự động
                      </button>
                    </div>
                    <input
                      className="input-field text-sm font-mono"
                      placeholder="Nhập mã giao dịch sau khi chuyển khoản (VD: FT2630291823)"
                      value={txCode}
                      onChange={(e) => setTxCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      processMutation.mutate({ id: txModal.id, status: 'FAILED' });
                    }}
                    disabled={processMutation.isPending}
                    className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Báo lỗi STK
                  </button>

                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setTxModal(null)}
                      className="btn-secondary text-sm"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!modalBankInfo?.account_number) {
                          return toast.error(
                            'Ứng viên chưa có số tài khoản ngân hàng, không thể xác nhận đã chuyển khoản'
                          );
                        }
                        if (!txCode.trim()) {
                          return toast.error('Vui lòng nhập mã giao dịch ngân hàng để đối soát');
                        }
                        processMutation.mutate({
                          id: txModal.id,
                          status: 'PAID',
                          transaction_code: txCode.trim(),
                          payment_method: qrImageUrl ? 'VIETQR' : 'BANK_TRANSFER',
                        });
                      }}
                      disabled={processMutation.isPending || !modalBankInfo?.account_number}
                      className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                      {processMutation.isPending ? 'Đang lưu...' : 'Xác nhận đã chuyển khoản'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo yêu cầu thanh toán mới (Chặn chọn thành viên đã thanh toán hoặc đang chờ xử lý) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl my-8 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Tạo yêu cầu thanh toán thù lao</h3>
                <p className="text-xs text-gray-500">
                  Mỗi thành viên chỉ được tạo 1 khoản quyết toán thù lao cho mỗi dự án tham gia
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                aria-label="Đóng"
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {membersLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bước 1: Lọc theo Dự án / Workspace */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    1. Lọc theo Dự án / Workspace
                  </label>
                  <select
                    className="input-field text-sm"
                    value={selectedWorkspaceId}
                    onChange={(e) => {
                      setSelectedWorkspaceId(e.target.value);
                      setCreateForm((p) => ({ ...p, workspace_member_id: '', amount: '' }));
                    }}
                  >
                    <option value="">-- Tất cả dự án ({payableMembers.length} thành viên) --</option>
                    {workspaceOptions.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name} {ws.projectStatus === 'COMPLETED' ? '(Đã nghiệm thu)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bước 2: Chọn thành viên (Khóa các thành viên đã PAID hoặc đang PENDING/PROCESSING) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    2. Thành viên nhận thù lao <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input-field text-sm"
                    value={createForm.workspace_member_id}
                    onChange={(e) => handleSelectMember(e.target.value)}
                  >
                    <option value="">-- Chọn ứng viên chưa thanh toán --</option>
                    {modalMembers.map((m) => {
                      const u = m.CandidateProfile?.User;
                      const projName = getProjectName(m.Workspace);
                      const jobTitle = m.ProjectJob?.title || 'Thành viên';
                      const budget = m.ProjectJob?.budget
                        ? formatCurrency(m.ProjectJob.budget)
                        : 'Chưa đặt mức thù lao';
                      const existing = m.Payments?.[0] || null;
                      const isLocked =
                        existing && ['PAID', 'PENDING', 'PROCESSING'].includes(existing.status);
                      const statusTag =
                        existing?.status === 'PAID'
                          ? ' — [ĐÃ THANH TOÁN - Không thể tạo lại]'
                          : existing?.status === 'PENDING' || existing?.status === 'PROCESSING'
                          ? ' — [ĐANG CHỜ XỬ LÝ - Đã tạo]'
                          : existing?.status === 'FAILED'
                          ? ' — [LỖI TT - Chọn để khôi phục]'
                          : '';

                      return (
                        <option key={m.id} value={m.id} disabled={isLocked}>
                          {u?.full_name} — {jobTitle} ({projName}) · {budget}
                          {statusTag}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Những thành viên đã thanh toán hoặc đã có yêu cầu chờ xử lý sẽ bị khóa để tránh tạo trùng.
                  </p>
                </div>

                {/* Thông tin chi tiết & kiểm tra điều kiện nghiệm thu của thành viên đang chọn */}
                {selectedMember && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Dự án & Vị trí:</span>
                      <span className="font-semibold text-gray-800">
                        {getProjectName(selectedMember.Workspace)} ·{' '}
                        {selectedMember.ProjectJob?.title || 'Thành viên'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Thù lao vị trí công bố:</span>
                      <span className="font-bold text-primary-700">
                        {selectedMember.ProjectJob?.budget
                          ? formatCurrency(selectedMember.ProjectJob.budget)
                          : 'Chưa thiết lập'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Tiến độ công việc trong dự án:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedMember.task_stats?.total_tasks > 0
                          ? `${selectedMember.task_stats.done_tasks}/${selectedMember.task_stats.total_tasks} task đã nghiệm thu`
                          : 'Chưa có task được giao'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Đánh giá năng lực:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedMember.CandidateEvaluation
                          ? `${parseFloat(selectedMember.CandidateEvaluation.score).toFixed(1)}/10`
                          : 'Chưa đánh giá'}
                      </span>
                    </div>

                    {/* Cảnh báo nếu thành viên chưa hoàn thành hết các task được giao */}
                    {selectedMember.task_stats?.total_tasks > 0 &&
                      selectedMember.task_stats.done_tasks <
                        selectedMember.task_stats.total_tasks && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
                          <Icon name="alert" className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>
                            Thành viên này còn{' '}
                            <strong>
                              {selectedMember.task_stats.total_tasks -
                                selectedMember.task_stats.done_tasks}{' '}
                              task chưa được nghiệm thu hoàn thành
                            </strong>
                            . Hãy chắc chắn bạn muốn tạo thanh toán ngay lúc này.
                          </span>
                        </div>
                      )}

                    <div className="pt-2 border-t border-gray-200">
                      {selectedMember.CandidateProfile?.PaymentInformation?.account_number ? (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-gray-500">Tài khoản nhận tiền:</span>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-700">
                              {selectedMember.CandidateProfile.PaymentInformation.bank_name}
                            </p>
                            <p className="font-mono text-gray-800">
                              {selectedMember.CandidateProfile.PaymentInformation.account_number} ·{' '}
                              {selectedMember.CandidateProfile.PaymentInformation.account_holder_name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-amber-600 font-medium flex items-center gap-1">
                          <Icon name="alert" className="w-4 h-4" />
                          Ứng viên chưa cập nhật số tài khoản ngân hàng (hệ thống sẽ gửi thông báo nhắc ứng viên cập nhật).
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Bước 3: Số tiền */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      3. Số tiền thanh toán (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    {selectedMember?.ProjectJob?.budget && (
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm((p) => ({
                            ...p,
                            amount: String(Math.round(Number(selectedMember.ProjectJob.budget))),
                          }))
                        }
                        className="text-xs text-primary-700 hover:underline font-medium"
                      >
                        Điền theo thù lao vị trí ({formatCurrency(selectedMember.ProjectJob.budget)})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    className="input-field"
                    placeholder="VD: 5000000"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))}
                  />
                  {createForm.amount && (
                    <p className="text-xs font-semibold text-primary-700 mt-1">
                      = {formatCurrency(createForm.amount)}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!createForm.workspace_member_id) {
                    return toast.error('Vui lòng chọn thành viên nhận thanh toán');
                  }
                  if (!createForm.amount || parseFloat(createForm.amount) < 1000) {
                    return toast.error('Số tiền phải từ 1.000đ trở lên');
                  }
                  createMutation.mutate(createForm);
                }}
                disabled={createMutation.isPending || !createForm.workspace_member_id}
                className="btn-primary disabled:opacity-50"
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo yêu cầu thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
