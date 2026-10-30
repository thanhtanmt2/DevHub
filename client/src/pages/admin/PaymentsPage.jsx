import { useState, useMemo } from 'react';
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
  PROCESSING: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
};

const METHOD_LABELS = {
  VIETQR: 'VietQR',
  BANK_TRANSFER: 'Chuyển khoản',
};

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

  // Chế độ xem: 'transactions' (Giao dịch thanh toán) | 'members' (Theo dõi theo thành viên dự án)
  const [activeView, setActiveView] = useState('transactions');

  // Bộ lọc chung
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
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
      toast.success(res.data?.message || 'Đã tạo thanh toán theo dự án');
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
        <div className="card bg-blue-50 border-blue-100 border text-center py-3">
          <p className="text-xl font-bold text-blue-700">{payableMembers.length}</p>
          <p className="text-xs text-blue-600 mt-0.5">Tổng thành viên các dự án</p>
        </div>
      </div>

      {/* View Switcher & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
          {/* Chuyển chế độ xem */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
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

      {/* ─── VIEW 1: DANH SÁCH GIAO DỊCH THANH TOÁN ─── */}
      {activeView === 'transactions' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Ứng viên</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Thông tin ngân hàng</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Dự án & Vị trí</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Số tiền (VNĐ)</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Mã GD</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Trạng thái</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Ngày TT</th>
                <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    {statusFilter
                      ? `Không có giao dịch ở trạng thái "${STATUS_LABELS[statusFilter]}"`
                      : 'Chưa có giao dịch thanh toán nào'}
                  </td>
                </tr>
              )}
              {payments.map((p) => {
                const candidate = p.WorkspaceMember?.CandidateProfile;
                const bankInfo = candidate?.PaymentInformation;
                const user = candidate?.User;
                const ws = p.WorkspaceMember?.Workspace;
                const projectName = getProjectName(ws);
                const job = p.WorkspaceMember?.ProjectJob;
                const evalInfo = p.WorkspaceMember?.CandidateEvaluation;
                const isEditable = p.status === 'PENDING' || p.status === 'FAILED';

                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">{user?.full_name || '—'}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </td>
                    <td className="p-3">
                      {bankInfo?.account_number ? (
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-gray-700">{bankInfo.bank_name}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-600 font-mono">{bankInfo.account_number}</span>
                            <button
                              type="button"
                              onClick={() => copyText(bankInfo.account_number, 'số tài khoản')}
                              className="text-[10px] text-primary-600 hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-gray-400 uppercase">{bankInfo.account_holder_name}</p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Icon name="alert" className="w-3.5 h-3.5" /> Chưa có STK
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-gray-800 text-xs">{projectName}</p>
                      {job?.title && (
                        <p className="text-xs text-primary-600 mt-0.5">
                          {job.title}
                          {job.budget ? ` (${formatCurrency(job.budget)})` : ''}
                        </p>
                      )}
                      {evalInfo && (
                        <span className="inline-block mt-1 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                          Đánh giá: {parseFloat(evalInfo.score).toFixed(1)}/10
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-base">
                          {formatCurrency(p.amount)}
                        </span>
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditTarget(p);
                              setEditAmount(String(Math.round(Number(p.amount || 0))));
                            }}
                            title="Điều chỉnh số tiền"
                            className="text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-gray-100"
                          >
                            <Icon name="pencil" className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {p.transaction_code ? (
                        <div>
                          <p className="font-mono text-xs text-gray-700 font-medium">
                            {p.transaction_code}
                          </p>
                          {p.payment_method && (
                            <span className="text-[10px] text-gray-400">
                              {METHOD_LABELS[p.payment_method] || p.payment_method}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`badge text-xs font-semibold px-2 py-1 whitespace-nowrap ${
                          STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                      {p.paid_at ? (
                        <div>
                          <p className="font-medium text-emerald-700">
                            {new Date(p.paid_at).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(p.paid_at).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {p.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                          <Icon name="lock" className="w-3.5 h-3.5" /> Đã tất toán
                        </span>
                      ) : (
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {(p.status === 'PENDING' || p.status === 'PROCESSING') && (
                            <button
                              onClick={() => openQrModal(p)}
                              disabled={processMutation.isPending}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors shadow-sm"
                            >
                              <Icon name="card" className="w-3.5 h-3.5" />
                              Thanh toán QR
                            </button>
                          )}
                          {p.status === 'PENDING' && (
                            <button
                              onClick={() => processMutation.mutate({ id: p.id, status: 'PROCESSING' })}
                              disabled={processMutation.isPending}
                              className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                            >
                              Đang xử lý
                            </button>
                          )}
                          {p.status === 'PROCESSING' && (
                            <button
                              onClick={() => processMutation.mutate({ id: p.id, status: 'FAILED' })}
                              disabled={processMutation.isPending}
                              className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                            >
                              Báo lỗi
                            </button>
                          )}
                          {p.status === 'FAILED' && (
                            <button
                              onClick={() => openQrModal(p)}
                              disabled={processMutation.isPending}
                              className="text-xs px-2.5 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium transition-colors"
                            >
                              Thanh toán lại
                            </button>
                          )}
                          {isEditable && (
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await confirm({
                                  title: 'Hủy yêu cầu thanh toán',
                                  message: `Hủy yêu cầu thanh toán ${formatCurrency(
                                    p.amount
                                  )} của "${user?.full_name || ''}"? Sau khi hủy bạn có thể tạo lại nếu cần.`,
                                  confirmText: 'Hủy thanh toán',
                                  tone: 'danger',
                                });
                                if (ok) deleteMutation.mutate(p.id);
                              }}
                              disabled={deleteMutation.isPending}
                              title="Hủy yêu cầu thanh toán tạo nhầm"
                              className="text-xs px-2 py-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── VIEW 2: THEO DÕI THÙ LAO THEO THÀNH VIÊN DỰ ÁN ─── */}
      {activeView === 'members' && (
        <div className="card overflow-x-auto">
          {membersLoading ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Thành viên</th>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Dự án & Vị trí</th>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Tiến độ công việc</th>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Thù lao vị trí</th>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Ngân hàng</th>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Trạng thái TT</th>
                  <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberRows.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      Không có thành viên nào khớp bộ lọc
                    </td>
                  </tr>
                )}
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
                    <tr key={m.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{user?.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800 text-xs">{projectName}</span>
                          {projStatus === 'COMPLETED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                              Đã nghiệm thu
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary-600 mt-0.5">{job?.title || 'Thành viên'}</p>
                      </td>
                      <td className="p-3 text-xs">
                        {ts.total_tasks > 0 ? (
                          <div>
                            <span
                              className={`font-semibold ${
                                allDone ? 'text-emerald-700' : 'text-amber-600'
                              }`}
                            >
                              {ts.done_tasks}/{ts.total_tasks} task hoàn thành
                            </span>
                            <div className="w-28 bg-gray-100 h-1.5 rounded-full mt-1">
                              <div
                                className={`h-1.5 rounded-full ${
                                  allDone ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{
                                  width: `${Math.round((ts.done_tasks / ts.total_tasks) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Chưa giao task</span>
                        )}
                        {evalScore != null && (
                          <p className="text-[11px] text-gray-500 mt-1">
                            Đánh giá: <strong className="text-amber-600">{parseFloat(evalScore).toFixed(1)}/10</strong>
                          </p>
                        )}
                      </td>
                      <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                        {job?.budget ? formatCurrency(job.budget) : '—'}
                      </td>
                      <td className="p-3 text-xs">
                        {bankInfo?.account_number ? (
                          <div>
                            <p className="font-semibold text-gray-700">{bankInfo.bank_name}</p>
                            <p className="font-mono text-gray-500">{bankInfo.account_number}</p>
                          </div>
                        ) : (
                          <span className="text-amber-600">Chưa có STK</span>
                        )}
                      </td>
                      <td className="p-3">
                        {payment ? (
                          <div>
                            <span
                              className={`badge text-xs font-semibold px-2 py-1 ${
                                STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {STATUS_LABELS[payment.status] || payment.status}
                            </span>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        ) : (
                          <span className="badge text-xs bg-gray-100 text-gray-600 px-2 py-1">
                            Chưa tạo TT
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {!payment ? (
                          <button
                            type="button"
                            onClick={() => openCreateForMember(m)}
                            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors shadow-sm"
                          >
                            <Icon name="plus" className="w-3.5 h-3.5" /> Khởi tạo TT
                          </button>
                        ) : payment.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Icon name="lock" className="w-3.5 h-3.5" /> Đã tất toán
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const fullPayment = allPayments.find((p) => p.id === payment.id);
                              if (fullPayment) openQrModal(fullPayment);
                            }}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                          >
                            <Icon name="card" className="w-3.5 h-3.5" /> Thanh toán QR
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                <p className="text-xs font-semibold text-primary-600 mt-1">
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
                        className="text-[11px] text-primary-600 hover:underline font-medium"
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
                        className="text-xs text-primary-600 hover:underline font-medium"
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
                    <p className="text-xs font-semibold text-primary-600 mt-1">
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
