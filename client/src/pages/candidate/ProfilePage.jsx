import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '@/api/candidateApi';
import { skillApi } from '@/api/skillApi';
import { uploadApi } from '@/api/uploadApi';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];
const LEVEL_LABELS = { BEGINNER: 'Mới bắt đầu', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao', EXPERT: 'Chuyên gia' };
const LEVEL_COLORS = { BEGINNER: 'bg-gray-100 text-gray-700', INTERMEDIATE: 'bg-blue-100 text-blue-700', ADVANCED: 'bg-purple-100 text-purple-700', EXPERT: 'bg-green-100 text-green-700' };

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
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.full_name}</h1>
              <p className="text-gray-500 text-sm">{profile?.professional_title || 'Chưa cập nhật chức danh'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge bg-primary-100 text-primary-700">Điểm năng lực: {parseFloat(profile?.competency_score || 0).toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
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
    onSuccess: () => { qc.invalidateQueries(['candidate-profile']); toast.success('Cập nhật hồ sơ thành công!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Cập nhật thất bại'),
  });

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh chuyên môn</label>
          <input className="input-field" placeholder="VD: Senior Frontend Developer"
            value={form.professional_title} onChange={e => setForm({...form, professional_title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input className="input-field" placeholder="0901234567"
            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
          <input className="input-field" placeholder="Quận 7, TP. Hồ Chí Minh"
            value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input className="input-field" placeholder="https://github.com/username"
            value={form.github_url} onChange={e => setForm({...form, github_url: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
          <input className="input-field" placeholder="https://portfolio.com"
            value={form.portfolio_url} onChange={e => setForm({...form, portfolio_url: e.target.value})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
          <textarea className="input-field resize-none" rows={4}
            placeholder="Mô tả ngắn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
            value={form.introduction} onChange={e => setForm({...form, introduction: e.target.value})} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}

// ── CV Management Tab (Multiple CVs) ──────────────────
function CvTab({ profile, qc }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [cvTitle, setCvTitle] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);

  const { data: cvsRes, isLoading } = useQuery({
    queryKey: ['candidate-cvs'],
    queryFn: () => candidateApi.getMyCvs(),
  });

  const cvList = cvsRes?.data?.data || [];

  const handleUploadCV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file tối đa là 10MB');
      return;
    }

    try {
      setUploading(true);
      const res = await uploadApi.uploadCV(file);
      const { url, filename } = res.data.data;

      const titleToUse = cvTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
      await candidateApi.addCv({
        name: titleToUse,
        file_url: url,
        file_name: filename,
        file_size: file.size,
        is_default: makeDefault || cvList.length === 0,
      });

      qc.invalidateQueries(['candidate-cvs']);
      qc.invalidateQueries(['candidate-profile']);
      toast.success('Đã tải lên và lưu CV thành công!');
      setCvTitle('');
      setMakeDefault(false);
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
      qc.invalidateQueries(['candidate-cvs']);
      qc.invalidateQueries(['candidate-profile']);
      toast.success('Đã đặt làm CV mặc định');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt làm mặc định');
    }
  };

  const handleDeleteCV = async (cvId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản CV này khỏi hồ sơ không?')) return;
    try {
      await candidateApi.deleteCv(cvId);
      qc.invalidateQueries(['candidate-cvs']);
      qc.invalidateQueries(['candidate-profile']);
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
            <div className="text-4xl mb-2">📂</div>
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
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  cv.is_default
                    ? 'border-primary-300 bg-primary-50/30 ring-1 ring-primary-400/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary-100/70 border border-primary-200 flex items-center justify-center text-2xl shrink-0">
                    📄
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base truncate">{cv.name}</h4>
                      {cv.is_default && (
                        <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                          ⭐ CV Mặc định
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
                      ⭐ Đặt làm mặc định
                    </button>
                  )}
                  <a
                    href={cv.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>👁️</span> Xem CV ↗
                  </a>
                  <a
                    href={cv.file_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>📥</span> Tải về
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteCV(cv.id)}
                    className="btn text-xs py-1.5 px-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                    title="Xóa bản CV này"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload form for new CV */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>➕</span> Tải lên bản CV mới
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
            onChange={handleUploadCV}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50/10 p-7 rounded-2xl text-center cursor-pointer transition duration-150 flex flex-col items-center justify-center gap-2"
          >
            {uploading ? (
              <div className="flex items-center gap-3 text-sm text-primary-600 font-medium">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang tải file lên và thêm vào danh sách CV...</span>
              </div>
            ) : (
              <>
                <span className="text-3xl">📤</span>
                <p className="text-sm font-semibold text-gray-800">
                  Nhấp để tải lên hoặc kéo thả file CV vào đây
                </p>
                <p className="text-xs text-gray-400">
                  Hỗ trợ định dạng PDF, DOC, DOCX • Dung lượng tối đa 10MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="card bg-blue-50/40 border border-blue-100 p-5 rounded-xl">
        <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2 mb-2">
          <span>💡</span> Mẹo sử dụng nhiều CV hiệu quả
        </h4>
        <ul className="text-xs text-blue-900/80 space-y-1.5 list-disc list-inside">
          <li>Bạn có thể tạo các bản CV chuyên biệt: <strong>CV Frontend</strong> (tập trung React, UI/UX), <strong>CV Backend</strong> (tập trung Node.js, Database, Docker) hoặc <strong>CV Tiếng Anh</strong> cho các vị trí yêu cầu ngoại ngữ.</li>
          <li>CV được đánh dấu ⭐ <strong>CV Mặc định</strong> sẽ được tự động chọn đầu tiên khi bạn bấm nút ứng tuyển.</li>
          <li>Định dạng khuyên dùng tốt nhất là <strong>PDF</strong> để giữ nguyên định dạng thẩm mỹ.</li>
        </ul>
      </div>
    </div>
  );
}

// ── Skills Tab ────────────────────────────────────────
function SkillsTab({ mySkills, publicSkills, qc }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill_id: '', level: 'BEGINNER', years_of_experience: 0 });

  const addMutation = useMutation({
    mutationFn: (data) => candidateApi.addSkill(data),
    onSuccess: () => { qc.invalidateQueries(['candidate-skills']); setShowAdd(false); toast.success('Đã thêm kỹ năng!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Thêm kỹ năng thất bại'),
  });

  const removeMutation = useMutation({
    mutationFn: (skillId) => candidateApi.removeSkill(skillId),
    onSuccess: () => { qc.invalidateQueries(['candidate-skills']); toast.success('Đã xóa kỹ năng'); },
  });

  const mySkillIds = mySkills.map(s => s.skill_id);
  const availableSkills = publicSkills.filter(s => !mySkillIds.includes(s.id));

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Kỹ năng ({mySkills.length})</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">+ Thêm kỹ năng</button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kỹ năng</label>
              <select className="input-field" value={newSkill.skill_id} onChange={e => setNewSkill({...newSkill, skill_id: e.target.value})}>
                <option value="">Chọn kỹ năng...</option>
                {availableSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mức độ</label>
              <select className="input-field" value={newSkill.level} onChange={e => setNewSkill({...newSkill, level: e.target.value})}>
                {SKILL_LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Số năm kinh nghiệm</label>
              <input type="number" min="0" step="0.5" className="input-field"
                value={newSkill.years_of_experience} onChange={e => setNewSkill({...newSkill, years_of_experience: parseFloat(e.target.value)})} />
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
        {mySkills.length === 0 && <p className="text-gray-400 text-sm">Chưa có kỹ năng nào. Hãy thêm kỹ năng của bạn!</p>}
        {mySkills.map(s => (
          <div key={s.skill_id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${LEVEL_COLORS[s.level]}`}>
            <span>{s.Skill?.name || s.skill_id}</span>
            <span className="text-xs opacity-70">· {LEVEL_LABELS[s.level]}</span>
            <button onClick={() => removeMutation.mutate(s.skill_id)} className="ml-1 text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Experience Tab ────────────────────────────────────
function ExperienceTab({ experiences, qc }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ job_title: '', company_name: '', start_date: '', end_date: '', description: '' });

  const addMutation = useMutation({
    mutationFn: (data) => editId ? candidateApi.updateExperience(editId, data) : candidateApi.addExperience(data),
    onSuccess: () => { qc.invalidateQueries(['candidate-experiences']); setShowForm(false); setEditId(null); toast.success(editId ? 'Đã cập nhật!' : 'Đã thêm kinh nghiệm!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => candidateApi.deleteExperience(id),
    onSuccess: () => { qc.invalidateQueries(['candidate-experiences']); toast.success('Đã xóa'); },
  });

  const startEdit = (exp) => {
    setEditId(exp.id);
    setForm({ job_title: exp.job_title, company_name: exp.company_name, start_date: exp.start_date || '', end_date: exp.end_date || '', description: exp.description || '' });
    setShowForm(true);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Kinh nghiệm làm việc</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ job_title: '', company_name: '', start_date: '', end_date: '', description: '' }); }} className="btn-primary text-sm">+ Thêm</button>
      </div>

      {showForm && (
        <div className="mb-5 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chức vụ</label>
              <input className="input-field" value={form.job_title} onChange={e => setForm({...form, job_title: e.target.value})} placeholder="Senior Developer" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Công ty</label>
              <input className="input-field" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="FPT Software" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày bắt đầu</label>
              <input type="date" className="input-field" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày kết thúc (để trống nếu hiện tại)</label>
              <input type="date" className="input-field" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
              <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.job_title || !form.company_name || addMutation.isPending} className="btn-primary text-sm">
              {addMutation.isPending ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm')}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {experiences.length === 0 && <p className="text-gray-400 text-sm">Chưa có kinh nghiệm nào.</p>}
        {experiences.map(exp => (
          <div key={exp.id} className="flex items-start justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="font-medium text-gray-900">{exp.job_title}</p>
              <p className="text-sm text-gray-600">{exp.company_name}</p>
              <p className="text-xs text-gray-400">{exp.start_date} → {exp.end_date || 'Hiện tại'}</p>
              {exp.description && <p className="text-sm text-gray-500 mt-1">{exp.description}</p>}
            </div>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <button onClick={() => startEdit(exp)} className="text-xs text-primary-600 hover:underline">Sửa</button>
              <button onClick={() => deleteMutation.mutate(exp.id)} className="text-xs text-red-500 hover:underline">Xóa</button>
            </div>
          </div>
        ))}
      </div>
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
    onSuccess: () => { qc.invalidateQueries(['payment-info']); toast.success('Đã lưu thông tin nhận tiền!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Lưu thất bại'),
  });

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Thông tin nhận thù lao</h2>
      <p className="text-sm text-gray-500 mb-4">Thông tin này được dùng để Admin thực hiện thanh toán sau khi nghiệm thu dự án.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
          <input className="input-field" value={form.account_holder_name} onChange={e => setForm({...form, account_holder_name: e.target.value})} placeholder="NGUYEN VAN A" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
          <input className="input-field" value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="Vietcombank" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
          <input className="input-field" value={form.account_number} onChange={e => setForm({...form, account_number: e.target.value})} placeholder="1234567890" />
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
