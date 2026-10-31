import Icon, { IconBadge } from '@/components/common/Icon';
import ExperienceTab from '@/components/candidate/ExperienceTab';
import CvImportModal from '@/components/candidate/CvImportModal';
import { SkillEvidenceModal } from '@/components/common/Badges';
import { useConfirm } from '@/components/common/ConfirmDialog';
import AvatarUploader from '@/components/common/AvatarUploader';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '@/api/candidateApi';
import { skillApi } from '@/api/skillApi';
import { uploadApi } from '@/api/uploadApi';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  VIETQR_BANKS,
  resolveVietQrBank,
  buildVietQrUrl,
  decodeVietQrFromImage,
  stripAccents,
} from '@/utils/vietqr';


// trang hiển thị thông tin cá nhân của ứng viên 
export default function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'info';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['info', 'cv', 'skills', 'experience', 'payment'].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['candidate-skills'],
    queryFn: () => candidateApi.getSkills(),
  });

  const { data: expRes } = useQuery({
    queryKey: ['candidate-experiences'],
    queryFn: () => candidateApi.getExperiences(),
  });

  const { data: publicSkillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const { data: paymentRes } = useQuery({
    queryKey: ['payment-info'],
    queryFn: () => candidateApi.getPaymentInfo(),
  });

  const profile = profileRes?.data?.data;
  const mySkills = skillsRes?.data?.data || [];
  const experiences = expRes?.data?.data || [];
  const publicSkills = publicSkillsRes?.data?.data || [];
  const paymentInfo = paymentRes?.data?.data;

  if (isLoading) return <LoadingSpinner />;

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân' },
    { id: 'cv', label: 'Quản lý CV' },
    { id: 'skills', label: 'Kỹ năng' },
    { id: 'experience', label: 'Kinh nghiệm' },
    { id: 'payment', label: 'Thông tin nhận tiền' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient text-white p-6 mb-6 shadow-lift">
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <AvatarUploader size="xl" light className="ring-4 ring-white/40" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{user?.full_name}</h1>
            <p className="text-white">{profile?.professional_title || 'Chưa cập nhật chức danh'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-primary-700 text-sm font-bold shadow">
                <Icon name="star" className="w-4 h-4" />Điểm năng lực: {parseFloat(profile?.competency_score || 0).toFixed(1)}/10
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-sm font-medium">
                <Icon name="skills" className="w-4 h-4" />{mySkills.length} kỹ năng
              </span>
              {profile?.privacy_settings?.is_searchable === false ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/30 border border-rose-200/40 text-sm font-medium text-white">
                  <span className="w-2 h-2 rounded-full bg-rose-300" />
                  Đang ẩn khỏi tìm kiếm
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-200/40 text-sm font-medium text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-300" />
                  Đang cho phép tìm kiếm hồ sơ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto">
        <nav className="flex gap-2 min-w-max">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-600/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && <ProfileInfoTab profile={profile} qc={qc} />}
      {activeTab === 'cv' && <CvTab profile={profile} qc={qc} />}
      {activeTab === 'skills' && <SkillsTab mySkills={mySkills} publicSkills={publicSkills} qc={qc} />}
      {activeTab === 'experience' && <ExperienceTab experiences={experiences} qc={qc} />}
      {activeTab === 'payment' && <PaymentTab paymentInfo={paymentInfo} user={user} qc={qc} />}
    </div>
  );
}

const DEFAULT_PRIVACY_SETTINGS = {
  is_searchable: true,
  show_email: true,
  show_phone: true,
  show_address: true,
  show_links: true,
  show_introduction: true,
  show_cv: true,
  show_experiences: true,
  show_devhub_projects: true,
};

const PRIVACY_ITEMS = [
  {
    key: 'show_email',
    label: 'Địa chỉ Email',
    desc: 'Cho phép doanh nghiệp đã xác thực xem email liên hệ của bạn.',
  },
  {
    key: 'show_phone',
    label: 'Số điện thoại',
    desc: 'Cho phép doanh nghiệp đã xác thực xem số điện thoại liên hệ.',
  },
  {
    key: 'show_address',
    label: 'Địa chỉ / Khu vực',
    desc: 'Hiển thị địa chỉ nơi ở trên thẻ tìm kiếm và trang chi tiết ứng viên.',
  },
  {
    key: 'show_introduction',
    label: 'Giới thiệu bản thân',
    desc: 'Hiển thị đoạn giới thiệu mục tiêu nghề nghiệp và tóm tắt bản thân.',
  },
  {
    key: 'show_links',
    label: 'Liên kết GitHub & Portfolio',
    desc: 'Hiển thị đường dẫn tới mã nguồn GitHub và website cá nhân.',
  },
  {
    key: 'show_cv',
    label: 'Danh sách CV tải lên',
    desc: 'Cho phép nhà tuyển dụng xem trước và tải xuống các bản CV của bạn.',
  },
  {
    key: 'show_experiences',
    label: 'Sơ đồ kinh nghiệm làm việc',
    desc: 'Hiển thị lịch sử làm việc tại công ty, freelance và dự án cá nhân.',
  },
  {
    key: 'show_devhub_projects',
    label: 'Dự án đã tham gia trên DevHub',
    desc: 'Hiển thị các dự án thực chiến trên DevHub, số task hoàn thành và đánh giá.',
  },
];

// ── Profile Info Tab ──────────────────────────────────
function ProfileInfoTab({ profile, qc }) {
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({
    professional_title: profile?.professional_title || '',
    introduction: profile?.introduction || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    github_url: profile?.github_url || '',
    portfolio_url: profile?.portfolio_url || '',
  });
  const [privacy, setPrivacy] = useState(() => ({
    ...DEFAULT_PRIVACY_SETTINGS,
    ...(profile?.privacy_settings || {}),
  }));

  // Đồng bộ lại form khi profile được cập nhật (ví dụ sau khi lọc từ CV)
  useEffect(() => {
    setForm({
      professional_title: profile?.professional_title || '',
      introduction: profile?.introduction || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      github_url: profile?.github_url || '',
      portfolio_url: profile?.portfolio_url || '',
    });
  }, [
    profile?.professional_title,
    profile?.introduction,
    profile?.phone,
    profile?.address,
    profile?.github_url,
    profile?.portfolio_url,
  ]);

  useEffect(() => {
    setPrivacy({
      ...DEFAULT_PRIVACY_SETTINGS,
      ...(profile?.privacy_settings || {}),
    });
  }, [profile?.privacy_settings]);

  const mutation = useMutation({
    mutationFn: (data) => candidateApi.updateProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidate-profile'] }); toast.success('Cập nhật hồ sơ thành công!'); },
    onError: (err) => {
      // Backend trả về mảng lỗi { field, message } trong err.response.data.errors nếu dùng express-validator
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        toast.error(errors[0].message || errors[0].msg || 'Dữ liệu không hợp lệ');
      } else {
        toast.error(err.response?.data?.message || 'Cập nhật thất bại');
      }
    },
  });

  const privacyMutation = useMutation({
    mutationFn: (nextPrivacy) => candidateApi.updateProfile({ privacy_settings: nextPrivacy }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidate-profile'] });
      toast.success('Đã lưu tùy chỉnh quyền riêng tư');
    },
    onError: (err) => {
      setPrivacy({
        ...DEFAULT_PRIVACY_SETTINGS,
        ...(profile?.privacy_settings || {}),
      });
      toast.error(err.response?.data?.message || 'Không thể lưu quyền riêng tư');
    },
  });

  const handleTogglePrivacy = (key) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    privacyMutation.mutate(next);
  };

  const handlePresetPrivacy = (nextPartial) => {
    const next = { ...privacy, ...nextPartial };
    setPrivacy(next);
    privacyMutation.mutate(next);
  };

  const handleSave = () => {
    // 1. Kiểm tra số điện thoại (nếu có nhập thì phải hợp lệ)
    if (form.phone && !/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(form.phone)) {
      toast.error('Số điện thoại không hợp lệ!');
      return;
    }
    
    // 2. Kiểm tra định dạng URL (nếu có nhập)
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (form.github_url && !urlRegex.test(form.github_url)) {
      toast.error('Link GitHub không hợp lệ. Ví dụ: https://github.com/abc');
      return;
    }

    if (form.portfolio_url && !urlRegex.test(form.portfolio_url)) {
      toast.error('Link Portfolio không hợp lệ.');
      return;
    }

    // Pass hết thì mới gọi API
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Thông tin cá nhân</h2>
            <p className="text-xs text-gray-500">
              Cập nhật thông tin liên hệ và giới thiệu chuyên môn hoặc lọc tự động từ CV của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="btn-secondary text-sm"
          >
            Nhập từ CV
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh chuyên môn</label>
            <input className="input-field" placeholder="VD: Senior Frontend Developer"
              value={form.professional_title} onChange={e => setForm({ ...form, professional_title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input className="input-field" placeholder="0901234567"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <input className="input-field" placeholder="Quận 7, TP. Hồ Chí Minh"
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input className="input-field" placeholder="https://github.com/username"
              value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
            <input className="input-field" placeholder="https://portfolio.com"
              value={form.portfolio_url} onChange={e => setForm({ ...form, portfolio_url: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
            <textarea className="input-field resize-none" rows={4}
              placeholder="Mô tả ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
              value={form.introduction} onChange={e => setForm({ ...form, introduction: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Quyền riêng tư & Hiển thị với Nhà tuyển dụng */}
      <div className="card border border-primary-100">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="shield" className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Quyền riêng tư & Hiển thị với Nhà tuyển dụng</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kiểm soát những thông tin Nhà tuyển dụng được phép xem khi tìm kiếm ứng viên trên hệ thống.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={privacyMutation.isPending}
              onClick={() => handlePresetPrivacy(DEFAULT_PRIVACY_SETTINGS)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hiển thị tất cả
            </button>
            <button
              type="button"
              disabled={privacyMutation.isPending}
              onClick={() => handlePresetPrivacy({
                is_searchable: true,
                show_email: false,
                show_phone: false,
                show_address: false,
                show_cv: false,
              })}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              Ẩn liên hệ & CV
            </button>
          </div>
        </div>

        {/* Công tắc tổng: Cho phép tìm kiếm hồ sơ */}
        <div className={`p-4 rounded-xl border transition-colors mb-4 flex items-center justify-between gap-4 ${
          privacy.is_searchable
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-rose-50/60 border-rose-200'
        }`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                Cho phép Nhà tuyển dụng tìm thấy hồ sơ của tôi
              </span>
              <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                privacy.is_searchable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {privacy.is_searchable ? 'Đang bật' : 'Đang tắt'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {privacy.is_searchable
                ? 'Hồ sơ của bạn sẽ xuất hiện trong trang Tìm kiếm ứng viên của Nhà tuyển dụng theo các mục được bật bên dưới.'
                : 'Hồ sơ của bạn đã được ẩn hoàn toàn khỏi trang Tìm kiếm ứng viên của Nhà tuyển dụng.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={privacy.is_searchable}
            disabled={privacyMutation.isPending}
            onClick={() => handleTogglePrivacy('is_searchable')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              privacy.is_searchable ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                privacy.is_searchable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Danh sách công tắc từng phần */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${!privacy.is_searchable ? 'opacity-60' : ''}`}>
          {PRIVACY_ITEMS.map((item) => {
            const enabled = Boolean(privacy[item.key]);
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                      enabled ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {enabled ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  disabled={privacyMutation.isPending}
                  onClick={() => handleTogglePrivacy(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-2 text-xs text-blue-800">
          <Icon name="info" className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Lưu ý khi ứng tuyển:</strong> Đối với những công ty mà bạn đã <strong>chủ động nộp đơn ứng tuyển</strong> vào tin tuyển dụng của họ, công ty đó sẽ được phép xem đầy đủ hồ sơ và CV bạn đã nộp để phục vụ quá trình xét duyệt. Các công ty khác tìm kiếm trên hệ thống sẽ chỉ thấy những mục bạn bật cho phép ở trên.
          </span>
        </div>
      </div>

      {showImport && (
        <CvImportModal
          mode="info"
          onClose={() => setShowImport(false)}
          onDone={() => qc.invalidateQueries({ queryKey: ['candidate-profile'] })}
        />
      )}
    </div>
  );
}

// ── CV Management Tab (Multiple CVs) ──────────────────
function CvTab({ profile, qc }) {
  const confirm = useConfirm();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cvTitle, setCvTitle] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractOptions, setExtractOptions] = useState({
    info: true,
    skills: true,
    experience: true,
  });
  const [importModalConfig, setImportModalConfig] = useState(null);

  const { data: cvsRes, isLoading } = useQuery({
    queryKey: ['candidate-cvs'],
    queryFn: () => candidateApi.getMyCvs(),
  });

  const cvList = cvsRes?.data?.data || [];

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file tối đa là 10MB');
      return;
    }

    // Kiểm tra trùng lặp (dựa vào dung lượng hoặc tên file)
    const isDuplicate = cvList.some(cv => 
      cv.file_size === file.size || 
      cv.name.toLowerCase() === file.name.replace(/\.[^/.]+$/, "").toLowerCase()
    );

    if (isDuplicate) {
      if (!(await confirm({ title: 'CV có thể bị trùng', message: 'Phát hiện CV có tên hoặc dung lượng giống với một CV đã có trong danh sách. Bạn có chắc chắn muốn tải lên bản sao này không?', confirmText: 'Vẫn tải lên' }))) {
        // Reset input file
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }
    
    setSelectedFile(file);
    if (!cvTitle) {
      setCvTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadCV = async () => {
    if (!selectedFile) return;

    const modesToExtract = ['info', 'skills', 'experience'].filter((k) => extractOptions[k]);
    const isPdfFile = /\.pdf$/i.test(selectedFile.name);

    try {
      setUploading(true);
      const res = await uploadApi.uploadCV(selectedFile);
      const { url, filename } = res.data.data;

      const titleToUse = cvTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");
      const addRes = await candidateApi.addCv({
        name: titleToUse,
        file_url: url,
        file_name: filename,
        file_size: selectedFile.size,
        is_default: makeDefault || cvList.length === 0,
        skip_auto_extract: true,
      });

      const createdCv = addRes?.data?.data;

      qc.invalidateQueries({ queryKey: ['candidate-cvs'] });
      qc.invalidateQueries({ queryKey: ['candidate-profile'] });
      qc.invalidateQueries({ queryKey: ['candidate-skills'] });
      toast.success('Đã tải lên và lưu CV thành công!');
      setCvTitle('');
      setMakeDefault(false);
      setSelectedFile(null);

      if (modesToExtract.length > 0 && createdCv?.id) {
        if (isPdfFile) {
          setImportModalConfig({
            initialCvId: createdCv.id,
            modes: modesToExtract,
            autoParse: true,
          });
        } else {
          toast('Tính năng AI lọc thông tin tự động hiện chỉ hỗ trợ file PDF.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Tải lên CV thất bại');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetDefault = async (cvId) => {
    try {
      await candidateApi.setDefaultCv(cvId);
      qc.invalidateQueries({ queryKey: ['candidate-cvs'] });
      qc.invalidateQueries({ queryKey: ['candidate-profile'] });
      qc.invalidateQueries({ queryKey: ['candidate-skills'] });
      toast.success('Đã đặt làm CV mặc định');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt làm mặc định');
    }
  };

  const handleDeleteCV = async (cvId) => {
    if (!(await confirm({ title: 'Xóa CV', message: 'Bạn có chắc chắn muốn xóa bản CV này khỏi hồ sơ không?', confirmText: 'Xóa', tone: 'danger' }))) return;
    try {
      await candidateApi.deleteCv(cvId);
      qc.invalidateQueries({ queryKey: ['candidate-cvs'] });
      qc.invalidateQueries({ queryKey: ['candidate-profile'] });
      toast.success('Đã xóa CV khỏi danh sách');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa CV thất bại');
    }
  };

  const toggleExtractOption = (key) => {
    setExtractOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Quản lý danh sách CV ({cvList.length})</h2>
            <p className="text-sm text-gray-500">
              Bạn có thể lưu nhiều phiên bản CV khác nhau (ví dụ: CV Frontend, CV Backend, CV Tiếng Anh) và chọn CV phù hợp khi ứng tuyển.
            </p>
          </div>
        </div>

        {/* Existing CVs list */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Đang tải danh sách CV...</div>
        ) : cvList.length === 0 ? (
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 text-center mb-6">
            <IconBadge name="folder" size="lg" className="mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 text-base">Chưa có CV nào trong hồ sơ</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Hãy tải lên bản CV đầu tiên bên dưới để hệ thống lưu trữ và giúp bạn ứng tuyển nhanh chóng.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {cvList.map((cv) => {
              const isCvPdf = /\.pdf$/i.test((cv.file_url || '').split('?')[0]);
              return (
                <div
                  key={cv.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${cv.is_default
                      ? 'border-primary-300 bg-primary-50/30 ring-1 ring-primary-400/50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary-100/70 border border-primary-200 flex items-center justify-center text-primary-700 shrink-0">
                      <Icon name="document" className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-base truncate">{cv.name}</h4>
                        {cv.is_default && (
                          <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <Icon name="star" className="w-3 h-3 mr-1" />CV Mặc định
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                        <span className="truncate max-w-[220px]">Tệp: {cv.file_name}</span>
                        {cv.file_size && (
                          <span>• {(cv.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                        )}
                        <span>• Cập nhật: {new Date(cv.updated_at || cv.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {isCvPdf && (
                      <button
                        type="button"
                        onClick={() =>
                          setImportModalConfig({
                            initialCvId: cv.id,
                            modes: ['info', 'skills', 'experience'],
                            autoParse: false,
                          })
                        }
                        className="btn text-xs py-1.5 px-3 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-lg transition font-semibold"
                      >
                        Lọc thông tin
                      </button>
                    )}
                    {!cv.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(cv.id)}
                        className="btn text-xs py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
                      >
                        <Icon name="star" className="w-3.5 h-3.5 mr-1" />Đặt làm mặc định
                      </button>
                    )}
                    <a
                      href={cv.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Icon name="eye" className="w-4 h-4" /> Xem CV
                    </a>
                    <a
                      href={cv.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                    >
                      <Icon name="download" className="w-4 h-4" /> Tải về
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteCV(cv.id)}
                      className="btn text-xs py-1.5 px-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                      title="Xóa bản CV này"
                      aria-label="Xóa bản CV này"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload form for new CV */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="plus" className="w-4 h-4" /> Tải lên bản CV mới
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tên gọi gợi nhớ cho CV (Tùy chọn)
              </label>
              <input
                type="text"
                className="input-field text-sm"
                placeholder="VD: CV Frontend Developer, CV Tiếng Anh..."
                value={cvTitle}
                onChange={(e) => setCvTitle(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-5 text-sm text-gray-700 font-medium select-none">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="rounded text-primary-700 focus:ring-primary-500 w-4 h-4"
                />
                Đặt làm CV mặc định khi ứng tuyển
              </label>
            </div>
          </div>

          {/* Tùy chọn lọc thông tin từ CV khi tải lên */}
          <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800">
                Tùy chọn lọc thông tin từ CV sau khi tải lên (dành cho CV PDF):
              </span>
              <span className="text-[11px] text-slate-500">
                Bỏ chọn cả 3 nếu chỉ muốn lưu file CV
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'info', label: 'Thông tin cá nhân' },
                { key: 'skills', label: 'Kỹ năng' },
                { key: 'experience', label: 'Kinh nghiệm & Dự án' },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition ${
                    extractOptions[opt.key]
                      ? 'bg-primary-50 border-primary-400 text-primary-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={extractOptions[opt.key]}
                    onChange={() => toggleExtractOption(opt.key)}
                    className="rounded text-primary-700 focus:ring-primary-500 w-3.5 h-3.5"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50/10 p-7 rounded-2xl text-center cursor-pointer transition duration-150 flex flex-col items-center justify-center gap-2"
            >
              <IconBadge name="upload" size="lg" />
              <p className="text-sm font-semibold text-gray-800">
                Nhấp để chọn hoặc kéo thả file CV vào đây
              </p>
              <p className="text-xs text-gray-400">
                Hỗ trợ định dạng PDF, DOC, DOCX • Dung lượng tối đa 10MB
              </p>
            </div>
          ) : (
            <div className="border border-primary-200 bg-primary-50/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-primary-100 flex items-center justify-center text-primary-700 shrink-0 shadow-sm">
                  <Icon name="document" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <button 
                  type="button" 
                  onClick={() => { setSelectedFile(null); setCvTitle(''); }} 
                  disabled={uploading}
                  className="text-xs text-gray-500 hover:text-rose-500 font-medium transition"
                >
                  Hủy chọn file
                </button>
                <button 
                  type="button"
                  onClick={handleUploadCV} 
                  disabled={uploading} 
                  className="btn-primary py-2 text-sm shadow-sm flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="save" className="w-4 h-4" /> Lưu CV này
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guide Card */}
      <div className="card bg-primary-50/40 border border-primary-100 p-5 rounded-xl">
        <h4 className="text-sm font-bold text-primary-900 flex items-center gap-2 mb-2">
          <Icon name="lightbulb" className="w-4 h-4" /> Mẹo sử dụng nhiều CV hiệu quả
        </h4>
        <ul className="text-xs text-primary-900/80 space-y-1.5 list-disc list-inside">
          <li>Bạn có thể tạo các bản CV chuyên biệt: <strong>CV Frontend</strong> (tập trung React, UI/UX), <strong>CV Backend</strong> (tập trung Node.js, Database, Docker) hoặc <strong>CV Tiếng Anh</strong> cho các vị trí yêu cầu ngoại ngữ.</li>
          <li>CV được gắn nhãn <strong>CV Mặc định</strong> sẽ được tự động chọn đầu tiên khi bạn bấm nút ứng tuyển.</li>
          <li>Định dạng khuyên dùng tốt nhất là <strong>PDF</strong> để giữ nguyên định dạng thẩm mỹ và hỗ trợ AI lọc tự động.</li>
        </ul>
      </div>

      {importModalConfig && (
        <CvImportModal
          initialCvId={importModalConfig.initialCvId}
          modes={importModalConfig.modes}
          autoParse={importModalConfig.autoParse}
          onClose={() => setImportModalConfig(null)}
          onDone={() => {
            qc.invalidateQueries({ queryKey: ['candidate-profile'] });
            qc.invalidateQueries({ queryKey: ['candidate-skills'] });
            qc.invalidateQueries({ queryKey: ['candidate-experiences'] });
          }}
        />
      )}
    </div>
  );
}

// ── Skills Tab ────────────────────────────────────────
function SkillsTab({ mySkills, publicSkills, qc }) {
  const [showAdd, setShowAdd] = useState(false);
  const [evidenceOf, setEvidenceOf] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill_id: '' });

  const addMutation = useMutation({
    mutationFn: (data) => candidateApi.addSkill(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidate-skills'] }); setShowAdd(false); toast.success('Đã thêm kỹ năng!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Thêm kỹ năng thất bại'),
  });

  const removeMutation = useMutation({
    mutationFn: (skillId) => candidateApi.removeSkill(skillId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidate-skills'] }); toast.success('Đã xóa kỹ năng'); },
  });

  const mySkillIds = mySkills.map(s => s.skill_id);
  const availableSkills = publicSkills.filter(s => !mySkillIds.includes(s.id));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Kỹ năng ({mySkills.length})</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary text-sm">Nhập từ CV</button>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">+ Thêm kỹ năng</button>
        </div>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kỹ năng</label>
              <select className="input-field" value={newSkill.skill_id} onChange={e => setNewSkill({ ...newSkill, skill_id: e.target.value })}>
                <option value="">Chọn kỹ năng...</option>
                {availableSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => addMutation.mutate(newSkill)} disabled={!newSkill.skill_id || addMutation.isPending} className="btn-primary text-sm">
              {addMutation.isPending ? 'Đang thêm...' : 'Thêm'}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {mySkills.length === 0 && <p className="text-gray-400 text-sm">Chưa có kỹ năng nào. Hãy thêm kỹ năng hoặc tải CV (PDF) để hệ thống tự lọc kỹ năng!</p>}
        {mySkills.some(s => s.evidence?.length > 0) && <p className="w-full text-xs text-emerald-700">Kỹ năng viền xanh có minh chứng từ dự án đã hoàn thành trên nền tảng. Bấm vào tên kỹ năng để xem dự án.</p>}
        {mySkills.map(s => {
          const projects = [...new Set((s.evidence || []).map(e => e.project_name))];
          const verified = projects.length > 0;
          return (
          <div key={s.skill_id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${verified ? 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400 shadow-sm' : 'bg-gray-100 text-gray-700'}`}>
            {verified && <Icon name="verified" className="w-4 h-4 text-emerald-600" />}
            {verified
              ? <button type="button" onClick={() => setEvidenceOf(s)} className="underline decoration-dotted underline-offset-2 hover:text-emerald-900" title="Bấm để xem các dự án minh chứng">{s.Skill?.name || s.skill_id}</button>
              : <span>{s.Skill?.name || s.skill_id}</span>}
            {verified && <span className="text-xs opacity-70">· {projects.length} dự án</span>}
            {!verified && s.source === 'CV' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-gray-300">Từ CV</span>}
            <button onClick={() => removeMutation.mutate(s.skill_id)} className="ml-1 opacity-60 hover:opacity-100" aria-label="Xóa kỹ năng"><Icon name="x" className="w-3.5 h-3.5" /></button>
          </div>
          );
        })}
      </div>
      {showImport && <CvImportModal mode="skills" onClose={() => setShowImport(false)} onDone={() => qc.invalidateQueries({ queryKey: ['candidate-skills'] })} />}
      {evidenceOf && <SkillEvidenceModal skill={evidenceOf.Skill?.name || ''} evidence={evidenceOf.evidence} onClose={() => setEvidenceOf(null)} />}
    </div>
  );
}

// ── Payment Tab ───────────────────────────────────────
const PAYMENT_STATUS_META = {
  PENDING:    { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-primary-100 text-primary-700' },
  PAID:       { label: 'Đã nhận tiền', color: 'bg-emerald-100 text-emerald-700' },
  FAILED:     { label: 'Thất bại', color: 'bg-red-100 text-red-700' },
};

const formatVnd = (n) => (n ? `${new Intl.NumberFormat('vi-VN').format(n)}đ` : '0đ');

function PaymentTab({ paymentInfo, user, qc }) {
  const qrInputRef = useRef(null);
  const [form, setForm] = useState({
    account_holder_name: paymentInfo?.account_holder_name || '',
    bank_name: paymentInfo?.bank_name || '',
    account_number: paymentInfo?.account_number || '',
  });
  const [qrDecoded, setQrDecoded] = useState(null); // { bankName, bin, accountNumber, previewUrl }
  const [qrLoading, setQrLoading] = useState(false);
  const [manualUnlocked, setManualUnlocked] = useState(false);
  const [editedManually, setEditedManually] = useState(false);

  useEffect(() => {
    setForm({
      account_holder_name: paymentInfo?.account_holder_name || '',
      bank_name: paymentInfo?.bank_name || '',
      account_number: paymentInfo?.account_number || '',
    });
  }, [
    paymentInfo?.account_holder_name,
    paymentInfo?.bank_name,
    paymentInfo?.account_number,
  ]);

  const { data: myPaymentsRes, isLoading: paymentsLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => candidateApi.getMyPayments(),
  });

  const myPayments = myPaymentsRes?.data?.data || [];

  const mutation = useMutation({
    mutationFn: (data) => candidateApi.upsertPaymentInfo(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-info'] });
      setEditedManually(false);
      toast.success('Đã lưu thông tin nhận tiền!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lưu thất bại'),
  });

  const handleQrFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP...) chứa mã QR ngân hàng');
      return;
    }
    try {
      setQrLoading(true);
      const parsed = await decodeVietQrFromImage(file);
      const previewUrl = URL.createObjectURL(file);
      const defaultHolder =
        parsed.accountHolderName ||
        form.account_holder_name ||
        stripAccents(user?.full_name || '')
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .toUpperCase();

      setForm({
        bank_name: parsed.bank ? parsed.bank.shortName : parsed.bankName,
        account_number: parsed.accountNumber,
        account_holder_name: defaultHolder,
      });
      setQrDecoded({
        bankName: parsed.bank ? parsed.bank.shortName : parsed.bankName,
        bin: parsed.bin,
        accountNumber: parsed.accountNumber,
        previewUrl,
      });
      setManualUnlocked(false);
      setEditedManually(false);
      toast.success(`Đã đọc mã VietQR: ${parsed.bank ? parsed.bank.shortName : parsed.bankName} — STK ${parsed.accountNumber}`);
    } catch (err) {
      toast.error(err.message || 'Không đọc được mã QR từ ảnh này');
    } finally {
      setQrLoading(false);
      if (qrInputRef.current) qrInputRef.current.value = '';
    }
  };

  const handlePasteQr = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleQrFile(file);
          break;
        }
      }
    }
  };

  const matchedBank = resolveVietQrBank(form.bank_name);
  const sampleQrUrl = buildVietQrUrl({
    bankName: form.bank_name,
    accountNumber: form.account_number,
    accountHolderName: form.account_holder_name,
  });
  const isLockedByQr = !!qrDecoded && !manualUnlocked;

  const totalReceived = myPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalPending = myPayments
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const hasFailedPayment = myPayments.some((p) => p.status === 'FAILED');

  return (
    <div className="space-y-6" onPaste={handlePasteQr}>
      {hasFailedPayment && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <Icon name="alert" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Có khoản thanh toán không thành công do sai thông tin tài khoản
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Hãy dùng tính năng <b>Tải ảnh mã QR ngân hàng</b> ngay bên dưới để hệ thống tự động lấy đúng Ngân hàng và Số tài khoản của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Thống kê thu nhập từ dự án */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-emerald-50 border border-emerald-100 py-4 text-center">
          <p className="text-xl font-bold text-emerald-700">{formatVnd(totalReceived)}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Tổng thù lao đã nhận</p>
        </div>
        <div className="card bg-amber-50 border border-amber-100 py-4 text-center">
          <p className="text-xl font-bold text-amber-700">{formatVnd(totalPending)}</p>
          <p className="text-xs text-amber-600 mt-0.5">Đang chờ thanh toán</p>
        </div>
        <div className="card bg-primary-50 border border-primary-100 py-4 text-center">
          <p className="text-xl font-bold text-primary-700">{myPayments.length}</p>
          <p className="text-xs text-primary-700 mt-0.5">Tổng số giao dịch</p>
        </div>
      </div>

      {/* Tài khoản nhận thù lao */}
      <div className="card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Tài khoản ngân hàng nhận thù lao</h2>
            <p className="text-sm text-gray-500">
              Thông tin này được dùng để tạo mã VietQR tự động cho Admin chuyển khoản thù lao sau khi nghiệm thu dự án.
            </p>
          </div>
          {matchedBank && form.account_number && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Icon name="verified" className="w-3.5 h-3.5" /> Hỗ trợ VietQR ({matchedBank.code})
            </span>
          )}
        </div>

        {/* CÁCH 1 (KHUYÊN DÙNG): Tải ảnh mã QR ngân hàng để tự động tách STK */}
        <div className="rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-primary-50/40 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
              <Icon name="verified" className="w-3.5 h-3.5" /> KHUYÊN DÙNG — CHÍNH XÁC 100%, KHÔNG LO NHẬP NHẦM SỐ
            </span>
            <span className="text-xs text-emerald-800 font-medium">
              Hỗ trợ mọi ảnh QR từ App Ngân hàng (VietQR NAPAS)
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900">
            Tải ảnh mã QR nhận tiền từ App Ngân hàng của bạn để tự động điền
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Thay vì tự gõ tay dãy 10–14 chữ số dễ bị nhầm, bạn chỉ cần mở ứng dụng ngân hàng → lưu <b>Ảnh mã QR nhận tiền</b> và tải lên đây. Hệ thống sẽ giải mã chuẩn EMVCo NAPAS và tự động điền chính xác tuyệt đối <b>Ngân hàng</b> + <b>Số tài khoản</b>.
          </p>

          <input
            ref={qrInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleQrFile(e.target.files?.[0])}
            className="hidden"
          />

          <div className="mt-4">
            {!qrDecoded ? (
              <div
                onClick={() => qrInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleQrFile(e.dataTransfer.files?.[0]);
                }}
                className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-white/90 hover:bg-emerald-50/40 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  <Icon name="upload" className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {qrLoading ? 'Đang giải mã ảnh QR ngân hàng...' : 'Nhấp để chọn ảnh mã QR ngân hàng, kéo thả hoặc nhấn Ctrl + V để dán ảnh'}
                </p>
                <p className="text-xs text-slate-500">
                  Chấp nhận cả ảnh QR tải trực tiếp từ app ngân hàng hoặc ảnh chụp màn hình điện thoại có chứa mã QR
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-emerald-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={qrDecoded.previewUrl}
                    alt="QR đã tải lên"
                    className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                      <Icon name="verified" className="w-4 h-4" />
                      Đã trích xuất thành công từ mã VietQR chuẩn NAPAS!
                    </div>
                    <p className="text-xs text-slate-700 mt-1">
                      Ngân hàng: <b>{qrDecoded.bankName}</b> (BIN: <span className="font-mono">{qrDecoded.bin}</span>)
                    </p>
                    <p className="text-xs text-slate-700">
                      Số tài khoản: <b className="font-mono text-sm text-emerald-800">{qrDecoded.accountNumber}</b>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  className="btn-secondary text-xs py-1.5 px-3 shrink-0"
                >
                  Đổi ảnh QR khác
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cảnh báo khi người dùng tự gõ tay thay vì dùng ảnh QR */}
        {editedManually && !qrDecoded && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Icon name="alert" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold">Bạn đang tự nhập Số tài khoản bằng tay!</p>
                <p className="mt-0.5">
                  Việc gõ tay rất dễ nhầm 1–2 số dẫn đến không nhận được thù lao dự án. Chúng tôi <b>đặc biệt khuyến khích bạn tải ảnh mã QR ngân hàng</b> ở khung màu xanh phía trên để đảm bảo chính xác 100%.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => qrInputRef.current?.click()}
              className="btn-primary text-xs py-1.5 px-3 shrink-0 whitespace-nowrap"
            >
              Tải ảnh QR ngay
            </button>
          </div>
        )}

        {/* Form thông tin + Xem trước mã VietQR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Thông tin tài khoản thụ hưởng
              </span>
              {isLockedByQr && (
                <button
                  type="button"
                  onClick={() => setManualUnlocked(true)}
                  className="text-xs text-slate-500 hover:text-primary-700 underline"
                >
                  Mở khóa để sửa thủ công (không khuyến khích)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngân hàng
                </label>
                <select
                  disabled={isLockedByQr}
                  className={`input-field ${isLockedByQr ? 'bg-emerald-50/50 border-emerald-300 font-semibold text-slate-800 cursor-not-allowed' : ''}`}
                  value={matchedBank ? matchedBank.shortName : form.bank_name}
                  onChange={(e) => {
                    setEditedManually(true);
                    setForm({ ...form, bank_name: e.target.value });
                  }}
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {VIETQR_BANKS.map((b) => (
                    <option key={b.code} value={b.shortName}>
                      {b.shortName} — {b.name}
                    </option>
                  ))}
                </select>
                {isLockedByQr ? (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ Đã tự động điền và khóa bảo vệ từ mã QR ngân hàng
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Nên tải ảnh QR phía trên để hệ thống tự chọn đúng ngân hàng.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tài khoản
                </label>
                <input
                  readOnly={isLockedByQr}
                  className={`input-field font-mono ${
                    isLockedByQr
                      ? 'bg-emerald-50/50 border-emerald-300 font-bold text-emerald-900 cursor-not-allowed'
                      : ''
                  }`}
                  value={form.account_number}
                  onChange={(e) => {
                    setEditedManually(true);
                    setForm({
                      ...form,
                      account_number: e.target.value.replace(/[^0-9a-zA-Z]/g, '').trim(),
                    });
                  }}
                  placeholder="Tải ảnh QR ở trên để tự điền STK..."
                />
                {isLockedByQr && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    ✓ Đã khóa theo mã QR chuẩn NAPAS để chống gõ nhầm số
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản (In hoa không dấu)
                </label>
                <input
                  className="input-field uppercase font-semibold"
                  value={form.account_holder_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      account_holder_name: stripAccents(e.target.value).toUpperCase(),
                    })
                  }
                  placeholder="NGUYEN VAN A"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hệ thống tự động chuyển sang chữ IN HOA KHÔNG DẤU để đối chiếu khi Admin quét mã chuyển khoản.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  if (!form.account_holder_name.trim() || !form.bank_name.trim() || !form.account_number.trim()) {
                    return toast.error('Vui lòng tải ảnh QR ngân hàng hoặc điền đầy đủ thông tin tài khoản');
                  }
                  if (form.account_number.trim().length < 5) {
                    return toast.error('Số tài khoản quá ngắn, vui lòng kiểm tra lại');
                  }
                  mutation.mutate(form);
                }}
                disabled={mutation.isPending}
                className="btn-primary"
              >
                {mutation.isPending ? 'Đang lưu...' : 'Lưu thông tin nhận tiền'}
              </button>
            </div>
          </div>

          {/* Khung xem trước mã VietQR của ứng viên để tự quét đối chiếu */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-bold text-slate-700 mb-2">
              Mã VietQR nhận tiền của bạn
            </p>
            {sampleQrUrl ? (
              <div>
                <img
                  src={sampleQrUrl}
                  alt="VietQR mẫu của ứng viên"
                  className="w-44 h-44 object-contain mx-auto rounded-lg border bg-white p-1.5 shadow-sm"
                />
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Bạn có thể mở app ngân hàng quét thử mã này để kiểm tra tên người nhận hiện trên điện thoại đã đúng là <b>{form.account_holder_name || 'bạn'}</b> chưa.
                </p>
              </div>
            ) : (
              <div className="py-10 px-3 text-xs text-slate-400">
                Hãy tải ảnh QR ngân hàng ở khung phía trên để tạo mã VietQR chuẩn.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lịch sử nhận thù lao */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-1">Lịch sử nhận thù lao dự án</h2>
        <p className="text-sm text-gray-500 mb-4">
          Danh sách các khoản thanh toán thù lao từ các dự án thời vụ bạn đã tham gia trên DevHub.
        </p>

        {paymentsLoading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : myPayments.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400">
            <IconBadge name="card" size="lg" className="mx-auto mb-2" />
            <p className="text-sm">Chưa có giao dịch thanh toán thù lao nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b text-xs text-gray-600 uppercase">
                <tr>
                  <th className="p-3 font-semibold">Dự án / Workspace</th>
                  <th className="p-3 font-semibold">Vị trí đảm nhiệm</th>
                  <th className="p-3 font-semibold">Số tiền</th>
                  <th className="p-3 font-semibold">Mã giao dịch</th>
                  <th className="p-3 font-semibold">Trạng thái</th>
                  <th className="p-3 font-semibold">Ngày thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myPayments.map((p) => {
                  const ws = p.WorkspaceMember?.Workspace;
                  const projName = ws?.Project?.name || ws?.InternalProject?.name || ws?.name || 'Dự án DevHub';
                  const jobTitle = p.WorkspaceMember?.ProjectJob?.title || 'Thành viên';
                  const st = PAYMENT_STATUS_META[p.status] || {
                    label: p.status,
                    color: 'bg-gray-100 text-gray-600',
                  };

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium text-gray-900">{projName}</td>
                      <td className="p-3 text-xs text-gray-600">{jobTitle}</td>
                      <td className="p-3 font-bold text-primary-700 whitespace-nowrap">
                        {formatVnd(p.amount)}
                      </td>
                      <td className="p-3 font-mono text-xs text-gray-600">
                        {p.transaction_code || '—'}
                      </td>
                      <td className="p-3">
                        <span className={`badge text-xs font-semibold px-2.5 py-1 ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : p.createdAt || p.created_at
                          ? `Tạo: ${new Date(p.createdAt || p.created_at).toLocaleDateString('vi-VN')}`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
