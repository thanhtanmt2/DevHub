import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const VERIFY_STATUS = {
  PENDING:  { text: 'Chờ xác thực', cls: 'bg-yellow-100 text-yellow-700' },
  VERIFIED: { text: 'Đã xác thực',  cls: 'bg-green-100 text-green-700'  },
  REJECTED: { text: 'Đã từ chối',   cls: 'bg-red-100 text-red-700'      },
};

export default function ManageCompaniesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', statusFilter],
    queryFn: () => adminApi.getCompanies({ verification_status: statusFilter || undefined }),
  });
  const companies = data?.data?.data || [];

  const verifyMutation = useMutation({
    mutationFn: ({ id, verification_status }) => adminApi.verifyCompany(id, { verification_status }),
    onSuccess: (_, vars) => {
      const action = vars.verification_status === 'VERIFIED' ? '✅ Đã xác thực' : '🚫 Đã từ chối';
      toast.success(action + ' tài khoản doanh nghiệp');
      qc.invalidateQueries({ queryKey: ['admin-companies'] });
      setShowRejectModal(false);
      setRejectNote('');
      setSelectedCompany(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Có lỗi xảy ra'),
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)]">
      {/* Left: Company list */}
      <div className="w-[360px] flex-shrink-0 flex flex-col gap-3">
        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {[
            { value: 'PENDING', label: 'Chờ duyệt' },
            { value: 'VERIFIED', label: 'Đã xác thực' },
            { value: 'REJECTED', label: 'Từ chối' },
            { value: '', label: 'Tất cả' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setSelectedCompany(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === tab.value
                  ? 'bg-white shadow text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : companies.length === 0 ? (
            <div className="text-center text-gray-400 py-16 text-sm">Không có doanh nghiệp nào</div>
          ) : (
            companies.map(c => {
              const st = VERIFY_STATUS[c.verification_status] || {};
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCompany(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCompany?.id === c.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        👤 {c.User?.full_name} · {c.User?.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">MST: {c.tax_code}</p>
                    </div>
                    <span className={`badge text-xs shrink-0 ${st.cls}`}>{st.text}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(c.created_at || c.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Company Detail */}
      <div className="flex-1 min-w-0">
        {!selectedCompany ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-5xl mb-4">🏢</span>
            <p className="text-sm">Chọn một doanh nghiệp để xem chi tiết</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 h-full overflow-y-auto p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {selectedCompany.logo_url ? (
                  <img src={selectedCompany.logo_url} alt="logo" className="w-14 h-14 rounded-xl object-contain border border-gray-200 bg-gray-50" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">🏢</div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">MST: {selectedCompany.tax_code}</p>
                </div>
              </div>
              <span className={`badge ${VERIFY_STATUS[selectedCompany.verification_status]?.cls}`}>
                {VERIFY_STATUS[selectedCompany.verification_status]?.text}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Chủ tài khoản', value: selectedCompany.User?.full_name || '—' },
                { label: 'Email tài khoản', value: selectedCompany.User?.email || '—' },
                { label: 'Email công ty', value: selectedCompany.email || '—' },
                { label: 'Website', value: selectedCompany.website || '—' },
                { label: 'Địa chỉ', value: selectedCompany.address || '—' },
                { label: 'Ngày đăng ký', value: new Date(selectedCompany.created_at || selectedCompany.createdAt).toLocaleDateString('vi-VN') },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{value}</p>
                </div>
              ))}
            </div>

            {/* Email verification status */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${selectedCompany.company_email_verified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <span className="text-xl">{selectedCompany.company_email_verified ? '✅' : '⚠️'}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedCompany.company_email_verified ? 'Email công ty đã xác thực OTP' : 'Email công ty chưa xác thực OTP'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCompany.company_email_verified
                    ? `${selectedCompany.email} — doanh nghiệp đã chứng minh quyền sở hữu email công ty`
                    : 'Doanh nghiệp chưa hoàn tất xác thực OTP qua email công ty'}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedCompany.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Giới thiệu công ty</p>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedCompany.description}
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedCompany.verification_status === 'PENDING' && (
              <div className="flex gap-3 mt-auto pt-2">
                <button
                  disabled={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate({ id: selectedCompany.id, verification_status: 'VERIFIED' })}
                  className="btn-primary flex-1 py-3"
                >
                  {verifyMutation.isPending ? 'Đang xử lý...' : '✅ Xác thực doanh nghiệp'}
                </button>
                <button
                  disabled={verifyMutation.isPending}
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 py-3 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  🚫 Từ chối
                </button>
              </div>
            )}

            {selectedCompany.verification_status === 'VERIFIED' && (
              <div className="mt-auto pt-2">
                <button
                  disabled={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate({ id: selectedCompany.id, verification_status: 'REJECTED' })}
                  className="w-full py-3 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  🔒 Thu hồi xác thực
                </button>
              </div>
            )}

            {selectedCompany.verification_status === 'REJECTED' && (
              <div className="mt-auto pt-2">
                <button
                  disabled={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate({ id: selectedCompany.id, verification_status: 'VERIFIED' })}
                  className="btn-primary w-full py-3"
                >
                  ♻️ Xác thực lại
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Từ chối doanh nghiệp</h3>
            <p className="text-sm text-gray-600 mb-4">
              Nhập lý do từ chối doanh nghiệp "<strong>{selectedCompany?.name}</strong>":
            </p>
            <textarea
              className="input-field w-full h-24 resize-none"
              placeholder="Ví dụ: Mã số thuế không hợp lệ, thông tin không trung thực..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectNote(''); }}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                disabled={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate({ id: selectedCompany.id, verification_status: 'REJECTED' })}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                {verifyMutation.isPending ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
