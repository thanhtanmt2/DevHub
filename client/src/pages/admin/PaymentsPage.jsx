import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { workspaceApi } from '@/api/workspaceApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import PageBanner from '@/components/common/PageBanner';

const STATUS_LABELS = { PENDING: 'Chờ xử lý', PROCESSING: 'Đang xử lý', PAID: 'Đã thanh toán', FAILED: 'Thất bại' };
const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
};

const formatCurrency = (n) =>
  n ? `${new Intl.NumberFormat('vi-VN').format(n)}đ` : '0đ';

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ workspace_member_id: '', amount: '' });
  const [txModal, setTxModal] = useState(null); // { paymentId, type: 'PAID'|'FAILED' }
  const [txCode, setTxCode] = useState('');
  useEscapeKey(() => setTxModal(null), !!txModal);
  useEscapeKey(() => setShowCreate(false), showCreate);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.getPayments(),
  });

  // Fetch workspace members for create payment form
  const { data: projectsRes } = useQuery({
    queryKey: ['admin-projects-for-payment'],
    queryFn: () => workspaceApi.getProjects(),
    enabled: showCreate,
  });

  const processMutation = useMutation({
    mutationFn: ({ id, status, transaction_code }) =>
      adminApi.processPayment(id, { status, transaction_code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success('Đã cập nhật thanh toán');
      setTxModal(null);
      setTxCode('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success('Đã tạo yêu cầu thanh toán');
      setShowCreate(false);
      setCreateForm({ workspace_member_id: '', amount: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể tạo thanh toán'),
  });

  if (isLoading) return <LoadingSpinner />;
  const allPayments = data?.data?.data || [];
  const payments = statusFilter ? allPayments.filter(p => p.status === statusFilter) : allPayments;

  // Summary stats
  const totalPaid = allPayments.filter(p => p.status === 'PAID').reduce((s, p) => s + parseFloat(p.amount), 0);
  const totalPending = allPayments.filter(p => p.status === 'PENDING').length;
  const totalProcessing = allPayments.filter(p => p.status === 'PROCESSING').length;

  return (
    <div className="space-y-6">
      <PageBanner compact icon="card" title="Quản lý thanh toán thù lao" subtitle="Quản lý và xử lý thanh toán cho ứng viên trong dự án">
        <button onClick={() => setShowCreate(true)} className="btn-light">
          <Icon name="plus" className="w-4 h-4" /> Tạo thanh toán
        </button>
      </PageBanner>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border-emerald-100 border text-center py-3">
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-emerald-500">Tổng đã thanh toán</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100 border text-center py-3">
          <p className="text-xl font-bold text-yellow-700">{totalPending}</p>
          <p className="text-xs text-yellow-500">Chờ xử lý</p>
        </div>
        <div className="card bg-blue-50 border-blue-100 border text-center py-3">
          <p className="text-xl font-bold text-blue-700">{totalProcessing}</p>
          <p className="text-xs text-blue-500">Đang xử lý</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === '' ? `Tất cả (${allPayments.length})` : `${STATUS_LABELS[s]} (${allPayments.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Ứng viên</th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Thông tin ngân hàng</th>
              <th className="p-3 font-semibold text-gray-600 whitespace-nowrap">Workspace/Dự án</th>
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
                <td colSpan="8" className="p-6 text-center text-gray-400">
                  {statusFilter ? `Không có giao dịch ở trạng thái "${STATUS_LABELS[statusFilter]}"` : 'Chưa có giao dịch nào'}
                </td>
              </tr>
            )}
            {payments.map(p => {
              const candidate = p.WorkspaceMember?.CandidateProfile;
              const bankInfo = candidate?.PaymentInformation;
              const user = candidate?.User;
              return (
                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{user?.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </td>
                  <td className="p-3">
                    {bankInfo ? (
                      <div className="text-xs">
                        <p className="font-semibold text-gray-700">{bankInfo.bank_name}</p>
                        <p className="text-gray-500 font-mono">{bankInfo.account_number}</p>
                        <p className="text-gray-400">{bankInfo.account_holder_name}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Chưa có TT ngân hàng</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-gray-600">{p.WorkspaceMember?.Workspace?.name || '—'}</td>
                  <td className="p-3 font-bold text-gray-900 text-base">{formatCurrency(p.amount)}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{p.transaction_code || '—'}</td>
                  <td className="p-3">
                    <span className={`badge text-xs font-semibold px-2 py-1 whitespace-nowrap ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-400">
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => processMutation.mutate({ id: p.id, status: 'PROCESSING' })}
                          disabled={processMutation.isPending}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium transition-colors"
                        >
                          Bắt đầu xử lý
                        </button>
                      )}
                      {p.status === 'PROCESSING' && (
                        <>
                          <button
                            onClick={() => { setTxModal({ paymentId: p.id, type: 'PAID' }); setTxCode(''); }}
                            className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded font-medium transition-colors"
                          >
                            <Icon name="check" className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />Đã chuyển khoản
                          </button>
                          <button
                            onClick={() => processMutation.mutate({ id: p.id, status: 'FAILED' })}
                            disabled={processMutation.isPending}
                            className="text-xs px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded font-medium transition-colors"
                          >
                            Thất bại
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Code Modal (khi mark PAID) */}
      {txModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-1">Xác nhận thanh toán</h3>
            <p className="text-sm text-gray-500 mb-4">Nhập mã giao dịch ngân hàng để xác nhận</p>
            <input
              className="input-field mb-4"
              placeholder="Mã giao dịch (transaction code)"
              value={txCode}
              onChange={e => setTxCode(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setTxModal(null)} className="btn-secondary">Hủy</button>
              <button
                onClick={() => processMutation.mutate({ id: txModal.paymentId, status: 'PAID', transaction_code: txCode })}
                disabled={processMutation.isPending}
                className="btn-primary"
              >
                {processMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Tạo yêu cầu thanh toán mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID thành viên workspace</label>
                <input
                  className="input-field"
                  placeholder="workspace_member_id (UUID)"
                  value={createForm.workspace_member_id}
                  onChange={e => setCreateForm(p => ({ ...p, workspace_member_id: e.target.value }))}
                />
                <p className="text-xs text-gray-400 mt-1">Lấy ID thành viên từ trang quản lý dự án</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number" min="1000"
                  className="input-field"
                  placeholder="VD: 5000000"
                  value={createForm.amount}
                  onChange={e => setCreateForm(p => ({ ...p, amount: e.target.value }))}
                />
                {createForm.amount && (
                  <p className="text-xs text-primary-600 mt-1">= {formatCurrency(createForm.amount)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Hủy</button>
              <button
                onClick={() => {
                  if (!createForm.workspace_member_id.trim()) return toast.error('Vui lòng nhập ID thành viên');
                  if (!createForm.amount || parseFloat(createForm.amount) < 1000) return toast.error('Số tiền không hợp lệ');
                  createMutation.mutate(createForm);
                }}
                disabled={createMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
