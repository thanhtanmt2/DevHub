import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-payments'], queryFn: () => adminApi.getPayments() });
  
  const processMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.processPayment(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin-payments']); toast.success('Đã cập nhật thanh toán'); }
  });

  if (isLoading) return <LoadingSpinner />;
  const payments = data?.data?.data || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý Thanh toán thù lao</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Ứng viên</th>
              <th className="p-3">Dự án/Workspace</th>
              <th className="p-3">Số tiền (VNĐ)</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">Chưa có giao dịch</td></tr>}
            {payments.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <p className="font-medium">{p.WorkspaceMember?.CandidateProfile?.User?.full_name}</p>
                </td>
                <td className="p-3">{p.WorkspaceMember?.Workspace?.name}</td>
                <td className="p-3 font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(p.amount)}</td>
                <td className="p-3">
                  <span className={`badge ${
                    p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    p.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>{p.status}</span>
                </td>
                <td className="p-3">
                  {p.status === 'PENDING' && (
                    <button onClick={() => processMutation.mutate({ id: p.id, status: 'PROCESSING' })} className="text-blue-600 hover:underline mr-2">Xử lý</button>
                  )}
                  {p.status === 'PROCESSING' && (
                    <button onClick={() => processMutation.mutate({ id: p.id, status: 'PAID' })} className="text-green-600 hover:underline">Hoàn tất (Đã CK)</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
