import Icon, { IconBadge } from '@/components/common/Icon';
import ExperienceTab from '@/components/candidate/ExperienceTab';
import CvImportModal from '@/components/candidate/CvImportModal';
import { SkillEvidenceModal } from '@/components/common/Badges';
import { useConfirm } from '@/components/common/ConfirmDialog';
import AvatarUploader from '@/components/common/AvatarUploader';
﻿import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '@/api/candidateApi';
import { skillApi } from '@/api/skillApi';
import { uploadApi } from '@/api/uploadApi';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';


// trang hiển thị thông tin cá nhân của ứng viên 
export default function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');

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
      {activeTab === 'payment' && <PaymentTab paymentInfo={paymentInfo} qc={qc} />}
    </div>
  );
}

// ── Profile Info Tab ──────────────────────────────────
function ProfileInfoTab({ profile, qc }) {
  const [form, setForm] = useState({
    professional_title: profile?.professional_title || '',
    introduction: profile?.introduction || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    github_url: profile?.github_url || '',
    portfolio_url: profile?.portfolio_url || '',
  });

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
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
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

    try {
      setUploading(true);
      const res = await uploadApi.uploadCV(selectedFile);
      const { url, filename } = res.data.data;

      const titleToUse = cvTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");
      await candidateApi.addCv({
        name: titleToUse,
        file_url: url,
        file_name: filename,
        file_size: selectedFile.size,
        is_default: makeDefault || cvList.length === 0,
      });

      qc.invalidateQueries({ queryKey: ['candidate-cvs'] });
      qc.invalidateQueries({ queryKey: ['candidate-profile'] });
      qc.invalidateQueries({ queryKey: ['candidate-skills'] });
      toast.success('Đã tải lên và lưu CV thành công!');
      setCvTitle('');
      setMakeDefault(false);
      setSelectedFile(null);
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
            {cvList.map((cv) => (
              <div
                key={cv.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${cv.is_default
                    ? 'border-primary-300 bg-primary-50/30 ring-1 ring-primary-400/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary-100/70 border border-primary-200 flex items-center justify-center text-primary-600 shrink-0">
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
            ))}
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
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                Đặt làm CV mặc định khi ứng tuyển
              </label>
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
                <div className="w-10 h-10 rounded-lg bg-white border border-primary-100 flex items-center justify-center text-primary-600 shrink-0 shadow-sm">
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
      <div className="card bg-blue-50/40 border border-blue-100 p-5 rounded-xl">
        <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2 mb-2">
          <Icon name="lightbulb" className="w-4 h-4" /> Mẹo sử dụng nhiều CV hiệu quả
        </h4>
        <ul className="text-xs text-blue-900/80 space-y-1.5 list-disc list-inside">
          <li>Bạn có thể tạo các bản CV chuyên biệt: <strong>CV Frontend</strong> (tập trung React, UI/UX), <strong>CV Backend</strong> (tập trung Node.js, Database, Docker) hoặc <strong>CV Tiếng Anh</strong> cho các vị trí yêu cầu ngoại ngữ.</li>
          <li>CV được gắn nhãn <strong>CV Mặc định</strong> sẽ được tự động chọn đầu tiên khi bạn bấm nút ứng tuyển.</li>
          <li>Định dạng khuyên dùng tốt nhất là <strong>PDF</strong> để giữ nguyên định dạng thẩm mỹ.</li>
        </ul>
      </div>
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
function PaymentTab({ paymentInfo, qc }) {
  const [form, setForm] = useState({
    account_holder_name: paymentInfo?.account_holder_name || '',
    bank_name: paymentInfo?.bank_name || '',
    account_number: paymentInfo?.account_number || '',
  });

  const mutation = useMutation({
    mutationFn: (data) => candidateApi.upsertPaymentInfo(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payment-info'] }); toast.success('Đã lưu thông tin nhận tiền!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Lưu thất bại'),
  });

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Thông tin nhận thù lao</h2>
      <p className="text-sm text-gray-500 mb-4">Thông tin này được dùng để Admin thực hiện thanh toán sau khi nghiệm thu dự án.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
          <input 
            className="input-field uppercase" 
            value={form.account_holder_name} 
            onChange={e => setForm({ ...form, account_holder_name: e.target.value.toUpperCase() })} 
            placeholder="NGUYEN VAN A" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
          <input 
            list="bank-list"
            className="input-field" 
            value={form.bank_name} 
            onChange={e => setForm({ ...form, bank_name: e.target.value })} 
            placeholder="VD: Vietcombank, Techcombank..." 
          />
          <datalist id="bank-list">
            <option value="Vietcombank (VCB)" />
            <option value="Techcombank (TCB)" />
            <option value="MBBank (MB)" />
            <option value="ACB" />
            <option value="VPBank" />
            <option value="BIDV" />
            <option value="Agribank" />
            <option value="VietinBank" />
            <option value="Sacombank" />
            <option value="TPBank" />
            <option value="VIB" />
            <option value="HDBank" />
          </datalist>
          <p className="text-xs text-gray-500 mt-1">Chọn từ danh sách hoặc tự gõ tên ngân hàng của bạn.</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
          <input className="input-field" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} placeholder="1234567890" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </div>
  );
}
