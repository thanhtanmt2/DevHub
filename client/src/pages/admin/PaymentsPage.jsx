import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';
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

const copyText = (text, label = 'thông tin') => {
  if (!text) return;
  navigator.clipboard.writeText(String(text));
  toast.success(`Đã sao chép ${label}`);
};

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [createForm, setCreateForm] = useState({
    workspace_member_id: '',
    amount: '',
    payment_method: 'VIETQR',
  });

  // Modal thanh toán & quét VietQR: lưu toàn bộ object payment đang chọn
  const [txModal, setTxModal] = useState(null);
  const [txCode, setTxCode] = useState('');
  const [overrideBankCode, setOverrideBankCode] = useState('');

  useEscapeKey(() => setTxModal(null), !!txModal);
  useEscapeKey(() => setShowCreate(false), showCreate);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.getPayments(),
  });

  // Lấy danh sách thành viên trong các Workspace để chọn từ dropdown
  const { data: membersRes, isLoading: membersLoading } = useQuery({
    queryKey: ['admin-payable-members'],
    queryFn: () => adminApi.getPayableMembers(),
    enabled: showCreate,
  });

  const payableMembers = membersRes?.data?.data || [];

  // Danh sách các Workspace/Dự án có thành viên
  const workspaceOptions = useMemo(() => {
    const map = new Map();
    for (const m of payableMembers) {
      const ws = m.Workspace;
      if (ws && !map.has(ws.id)) {
        map.set(ws.id, {
          id: ws.id,
          name: ws.InternalProject?.name || ws.name,
          wsName: ws.name,
          projectStatus: ws.InternalProject?.status,
        });
      }
    }
    return Array.from(map.values());
  }, [payableMembers]);

  // Lọc thành viên theo Workspace đã chọn
  const filteredMembers = useMemo(() => {
    if (!selectedWorkspaceId) return payableMembers;
    return payableMembers.filter((m) => m.Workspace?.id === selectedWorkspaceId);
  }, [payableMembers, selectedWorkspaceId]);

  const selectedMember = useMemo(
    () => payableMembers.find((m) => m.id === createForm.workspace_member_id) || null,
    [payableMembers, createForm.workspace_member_id]
  );

  const handleSelectMember = (memberId) => {
    const member = payableMembers.find((m) => m.id === memberId);
    const suggestedBudget = member?.ProjectJob?.budget ? String(Math.round(Number(member.ProjectJob.budget))) : '';
    setCreateForm((prev) => ({
      ...prev,
      workspace_member_id: memberId,
      amount: suggestedBudget || prev.amount,
    }));
  };

  const processMutation = useMutation({
    mutationFn: ({ id, status, transaction_code, payment_method }) =>
      adminApi.processPayment(id, { status, transaction_code, payment_method }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-payable-members'] });
      toast.success('Đã cập nhật trạng thái thanh toán');
      setTxModal(null);
      setTxCode('');
      setOverrideBankCode('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => adminApi.createPayment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-payable-members'] });
      toast.success('Đã tạo yêu cầu thanh toán');
      setShowCreate(false);
      setCreateForm({ workspace_member_id: '', amount: '', payment_method: 'VIETQR' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể tạo thanh toán'),
  });

  if (isLoading) return <LoadingSpinner />;
  const allPayments = data?.data?.data || [];

  const payments = allPayments.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const user = p.WorkspaceMember?.CandidateProfile?.User;
      const wsName = p.WorkspaceMember?.Workspace?.InternalProject?.name || p.WorkspaceMember?.Workspace?.name || '';
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
        subtitle="Quản lý, quét mã VietQR và xác nhận thanh toán thù lao cho ứng viên trong dự án"
      >
        <button onClick={() => setShowCreate(true)} className="btn-light">
          <Icon name="plus" className="w-4 h-4" /> Tạo thanh toán
        </button>
      </PageBanner>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-emerald-50 border-emerald-100 border text-center py-3">
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Tổng đã giải ngân</p>
        </div>
        <div className="card bg-amber-50 border-amber-100 border text-center py-3">
          <p className="text-xl font-bold text-amber-700">{formatCurrency(totalPendingAmount)}</p>
          <p className="text-xs text-amber-600 mt-0.5">Tổng chờ thanh toán</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100 border text-center py-3">
          <p className="text-xl font-bold text-yellow-700">{totalPending}</p>
          <p className="text-xs text-yellow-600 mt-0.5">Khoản chờ xử lý</p>
        </div>
        <div className="card bg-blue-50 border-blue-100 border text-center py-3">
          <p className="text-xl font-bold text-blue-700">{totalProcessing}</p>
          <p className="text-xs text-blue-600 mt-0.5">Khoản đang xử lý</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {['', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === ''
                ? `Tất cả (${allPayments.length})`
                : `${STATUS_LABELS[s]} (${allPayments.filter((p) => p.status === s).length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="input-field pl-9 py-1.5 text-xs"
            placeholder="Tìm ứng viên, dự án, mã GD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
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
                    : 'Chưa có giao dịch nào'}
                </td>
              </tr>
            )}
            {payments.map((p) => {
              const candidate = p.WorkspaceMember?.CandidateProfile;
              const bankInfo = candidate?.PaymentInformation;
              const user = candidate?.User;
              const ws = p.WorkspaceMember?.Workspace;
              const projectName = ws?.InternalProject?.name || ws?.name || '—';
              const job = p.WorkspaceMember?.ProjectJob;

              return (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{user?.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </td>
                  <td className="p-3">
                    {bankInfo ? (
                      <div className="text-xs space-y-0.5">
                        <p className="font-semibold text-gray-700">{bankInfo.bank_name}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-600 font-mono">{bankInfo.account_number}</span>
                          <button
                            type="button"
                            onClick={() => copyText(bankInfo.account_number, 'số tài khoản')}
                            className="text-[10px] text-primary-600 hover:underline"
                            title="Sao chép số tài khoản"
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
                  </td>
                  <td className="p-3 font-bold text-gray-900 text-base whitespace-nowrap">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="p-3">
                    {p.transaction_code ? (
                      <div>
                        <p className="font-mono text-xs text-gray-700 font-medium">{p.transaction_code}</p>
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
                    <div className="flex gap-1.5 flex-wrap">
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
                ) : modalBankInfo ? (
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
                          {txModal.WorkspaceMember?.Workspace?.InternalProject?.name ||
                            txModal.WorkspaceMember?.Workspace?.name}
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

                  {modalBankInfo && (
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
                      disabled={processMutation.isPending}
                      className="btn-primary text-sm flex items-center gap-1.5"
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

      {/* Modal Tạo yêu cầu thanh toán mới (Chọn từ Dự án & Thành viên) */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl my-8 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Tạo yêu cầu thanh toán thù lao</h3>
                <p className="text-xs text-gray-500">
                  Chọn dự án và thành viên để tự động lấy mức thù lao & tài khoản ngân hàng
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

                {/* Bước 2: Chọn thành viên */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    2. Thành viên nhận thù lao <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="input-field text-sm"
                    value={createForm.workspace_member_id}
                    onChange={(e) => handleSelectMember(e.target.value)}
                  >
                    <option value="">-- Chọn ứng viên trong Workspace --</option>
                    {filteredMembers.map((m) => {
                      const u = m.CandidateProfile?.User;
                      const projName = m.Workspace?.InternalProject?.name || m.Workspace?.name || '';
                      const jobTitle = m.ProjectJob?.title || 'Thành viên';
                      const budget = m.ProjectJob?.budget ? formatCurrency(m.ProjectJob.budget) : 'Chưa đặt mức thù lao';
                      const existingPaid = m.Payments?.some((p) => p.status === 'PAID');
                      const existingPending = m.Payments?.some((p) =>
                        ['PENDING', 'PROCESSING'].includes(p.status)
                      );
                      const statusTag = existingPaid
                        ? ' [Đã TT]'
                        : existingPending
                        ? ' [Đang chờ TT]'
                        : '';
                      return (
                        <option key={m.id} value={m.id}>
                          {u?.full_name} — {jobTitle} ({projName}) · {budget}
                          {statusTag}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Thông tin chi tiết của thành viên đang chọn */}
                {selectedMember && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Vị trí đảm nhiệm:</span>
                      <span className="font-semibold text-gray-800">
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
                    <div className="pt-2 border-t border-gray-200">
                      {selectedMember.CandidateProfile?.PaymentInformation ? (
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
                          Ứng viên này chưa cập nhật số tài khoản ngân hàng trong hồ sơ (vẫn có thể tạo yêu cầu để nhắc ứng viên).
                        </p>
                      )}
                    </div>

                    {selectedMember.Payments?.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-amber-700 font-semibold mb-1">
                          Lưu ý: Thành viên này đã có {selectedMember.Payments.length} khoản thanh toán trong dự án này:
                        </p>
                        <ul className="space-y-1">
                          {selectedMember.Payments.map((ep) => (
                            <li key={ep.id} className="flex justify-between text-gray-600">
                              <span>{formatCurrency(ep.amount)}</span>
                              <span className="font-medium">{STATUS_LABELS[ep.status] || ep.status}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                disabled={createMutation.isPending}
                className="btn-primary"
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
