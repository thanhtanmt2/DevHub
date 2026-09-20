import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi } from '@/api/candidateApi';
import { skillApi } from '@/api/skillApi';
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
