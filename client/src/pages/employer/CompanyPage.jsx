import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '@/api/companyApi';
import { uploadApi } from '@/api/uploadApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CompanyPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    tax_code: '',
    address: '',
    website: '',
    description: '',
    logo_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Email verification state
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Lấy dữ liệu công ty hiện tại
  const { data, isLoading } = useQuery({
    queryKey: ['employer-company'],
    queryFn: () => companyApi.getMyCompany(),
  });

  const company = data?.data?.data;
  const isUpdating = !!company;

  // Đổ dữ liệu vào form khi fetch thành công
  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        tax_code: company.tax_code || '',
        address: company.address || '',
        website: company.website || '',
        description: company.description || '',
        logo_url: company.logo_url || ''
      });
      setVerifyEmail(company.email || '');
    }
  }, [company]);

  // Mutation lưu thông tin
  const mutation = useMutation({
    mutationFn: (payload) => isUpdating ? companyApi.updateCompany(payload) : companyApi.createCompany(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-company'] });
      toast.success(isUpdating ? 'Cập nhật thành công!' : 'Tạo hồ sơ thành công!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  });

  // Mutation gửi OTP
  const sendOtpMutation = useMutation({
    mutationFn: () => companyApi.sendVerifyEmail(verifyEmail),
    onSuccess: () => {
      setOtpSent(true);
      toast.success(`📧 Đã gửi OTP đến ${verifyEmail}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Gửi OTP thất bại'),
  });

  // Mutation xác thực OTP
  const verifyOtpMutation = useMutation({
    mutationFn: () => companyApi.verifyEmail(otp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-company'] });
      setOtpSent(false);
      setOtp('');
      toast.success('✅ Email doanh nghiệp đã được xác thực!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'OTP không đúng hoặc đã hết hạn'),
  });

  const handleSave = () => {
    if (!form.name || !form.tax_code || !form.address) {
      toast.error('Vui lòng điền đủ Tên, Mã số thuế và Địa chỉ');
      return;
    }
    mutation.mutate(form);
  };

  // Upload Logo
  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra định dạng và dung lượng
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ file hình ảnh');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 2MB');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadApi.uploadImage(file); // Giả định uploadApi.uploadImage trả về { success: true, url: '...' }
      if (res.data?.success) {
        setForm({ ...form, logo_url: res.data.data.url });
        toast.success('Tải logo lên thành công');
      }
    } catch (error) {
      toast.error('Lỗi khi tải logo lên');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  // Hàm render Badge trạng thái
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">✅ Đã xác thực</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">❌ Bị từ chối</span>;
      case 'PENDING':
      default:
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">⏳ Đang chờ duyệt</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ Doanh nghiệp</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý thông tin công ty để ứng viên hiểu rõ hơn về bạn.</p>
        </div>
        {company && (
          <div>
            {renderStatusBadge(company.verification_status)}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header - Cover & Logo */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative"></div>
        <div className="px-6 sm:px-10 pb-8 relative">
          
          {/* Logo Upload */}
          <div className="-mt-16 mb-6 flex flex-col sm:flex-row sm:items-end gap-6 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden flex items-center justify-center transition-transform hover:scale-105">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
                ) : (
                  <span className="text-gray-300 text-5xl">🏢</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer text-white font-medium text-sm backdrop-blur-sm shadow-inner">
                {isUploading ? 'Đang tải...' : 'Đổi Logo'}
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} disabled={isUploading} />
              </label>
            </div>
            <div className="pb-2">
              <h2 className="text-xl font-bold text-gray-900">{form.name || 'Tên Công Ty'}</h2>
              <p className="text-sm text-gray-500">{form.tax_code ? `MST: ${form.tax_code}` : 'Chưa có MST'}</p>
            </div>
          </div>

          <hr className="mb-8 border-gray-100" />

          {/* Form Thông Tin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Thông tin cơ bản</h3>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty <span className="text-red-500">*</span></label>
              <input 
                className="input-field bg-gray-50 focus:bg-white transition-colors" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                placeholder="VD: CÔNG TY TNHH FPT SOFTWARE" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế <span className="text-red-500">*</span></label>
              <input 
                className="input-field bg-gray-50 focus:bg-white transition-colors font-mono" 
                value={form.tax_code} 
                onChange={e => setForm({...form, tax_code: e.target.value})} 
                placeholder="VD: 0101248141" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở <span className="text-red-500">*</span></label>
              <input 
                className="input-field bg-gray-50 focus:bg-white transition-colors" 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})} 
                placeholder="VD: Khu Công Nghệ Cao, Quận 9, TP. HCM" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input 
                className="input-field bg-gray-50 focus:bg-white transition-colors" 
                value={form.website} 
                onChange={e => setForm({...form, website: e.target.value})} 
                placeholder="VD: https://fptsoftware.com" 
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Giới thiệu công ty</h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tổng quan, văn hóa & môi trường làm việc</label>
              <textarea 
                rows={6}
                className="input-field bg-gray-50 focus:bg-white transition-colors resize-y leading-relaxed" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                placeholder="Chia sẻ về sứ mệnh, môi trường làm việc và đãi ngộ của công ty bạn..."
              />
            </div>
          </div>

          {/* ===== EMAIL XÁC THỰC DOANH NGHIỆP ===== */}
          {company && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Xác thực email doanh nghiệp</h3>
              <p className="text-sm text-gray-500 mb-4">
                Sử dụng email công ty để xác thực danh tính. Email miễn phí (Gmail, Yahoo...) không được chấp nhận.
              </p>

              {company.company_email_verified ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-700">Email đã được xác thực</p>
                    <p className="text-sm text-green-600">{company.email}</p>
                  </div>
                  <button
                    onClick={() => { setOtpSent(false); setOtp(''); setVerifyEmail(''); }}
                    className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Đổi email khác
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <span>⚠️</span>
                    <p className="text-sm font-medium">Tài khoản chưa được xác thực — bạn chưa thể đăng tin tuyển dụng</p>
                  </div>

                  {!otpSent ? (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        className="input-field flex-1 bg-white"
                        placeholder="hr@congty.vn"
                        value={verifyEmail}
                        onChange={e => setVerifyEmail(e.target.value)}
                      />
                      <button
                        disabled={sendOtpMutation.isPending || !verifyEmail}
                        onClick={() => sendOtpMutation.mutate()}
                        className="btn-primary px-5 whitespace-nowrap"
                      >
                        {sendOtpMutation.isPending ? 'Đang gửi...' : '📧 Gửi OTP'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Nhập mã OTP 6 chữ số đã gửi đến <strong>{verifyEmail}</strong>
                        <span className="text-xs text-gray-400 ml-1">(hiệu lực 10 phút)</span>
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          className="input-field bg-white font-mono text-center text-xl tracking-widest w-40"
                          placeholder="______"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                          disabled={verifyOtpMutation.isPending || otp.length !== 6}
                          onClick={() => verifyOtpMutation.mutate()}
                          className="btn-primary px-5"
                        >
                          {verifyOtpMutation.isPending ? 'Đang xác thực...' : 'Xác nhận'}
                        </button>
                        <button
                          onClick={() => { setOtpSent(false); setOtp(''); }}
                          className="px-4 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                          Gửi lại
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={handleSave} 
              disabled={mutation.isPending} 
              className="btn-primary px-8 py-2.5 shadow-md hover:shadow-lg transition-all"
            >
              {mutation.isPending ? 'Đang lưu...' : 'Lưu Hồ Sơ Doanh Nghiệp'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
