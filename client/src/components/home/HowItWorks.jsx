import { useState } from 'react';
import Icon from '@/components/common/Icon';
import Reveal, { useInView } from '@/components/home/Reveal';
import SectionHeader from '@/components/home/SectionHeader';

const FLOWS = {
  candidate: {
    label: 'Ứng viên',
    steps: [
      { icon: 'user', title: 'Tạo hồ sơ năng lực', desc: 'Thêm kỹ năng, kinh nghiệm và CV để nhà tuyển dụng dễ tìm thấy bạn.' },
      { icon: 'search', title: 'Ứng tuyển cơ hội phù hợp', desc: 'Nhận đề xuất theo kỹ năng và theo dõi trạng thái hồ sơ theo thời gian thực.' },
      { icon: 'star', title: 'Làm việc và nhận đánh giá', desc: 'Hoàn thành công việc trong Workspace, được nghiệm thu và đánh giá năng lực.' },
    ],
  },
  employer: {
    label: 'Nhà tuyển dụng',
    steps: [
      { icon: 'shield', title: 'Xác thực doanh nghiệp', desc: 'Hoàn tất thông tin để DevHub xác thực trước khi đăng tin.' },
      { icon: 'document', title: 'Đăng tin tuyển dụng', desc: 'Đăng tin hoặc chủ động tìm ứng viên theo kỹ năng và điểm năng lực.' },
      { icon: 'inbox', title: 'Quản lý hồ sơ tập trung', desc: 'Theo dõi và xử lý toàn bộ hồ sơ ứng tuyển tại một nơi.' },
    ],
  },
};

// 3 bước sử dụng DevHub, chuyển qua lại giữa vai trò ứng viên / nhà tuyển dụng
export default function HowItWorks() {
  const [role, setRole] = useState('candidate');
  const [lineRef, lineSeen] = useInView(0.5);
  const flow = FLOWS[role];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24">
      <Reveal>
        <SectionHeader center eyebrow="Cách hoạt động" title="Bắt đầu chỉ với 3 bước" />
        <div className="mt-6 flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm" role="tablist" aria-label="Vai trò">
            {Object.entries(FLOWS).map(([key, f]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={role === key}
                onClick={() => setRole(key)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${role === key ? 'bg-primary-600 text-white shadow' : 'text-slate-600 hover:text-primary-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div ref={lineRef} className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
        {/* Đường nối giữa các bước (vẽ dần khi cuộn tới) */}
        <div className="hidden md:block absolute top-8 left-[16.6%] right-[16.6%] h-0.5 bg-primary-100 rounded-full overflow-hidden" aria-hidden="true">
          <div className={`h-full bg-primary-400 transition-[width] duration-[1400ms] ease-out ${lineSeen ? 'w-full' : 'w-0'}`} />
        </div>
        {flow.steps.map((s, i) => (
          <div key={`${role}-${s.title}`} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 90}ms`, animationFillMode: 'both' }}>
            <div className="relative mx-auto w-16 h-16">
              <span className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-soft text-primary-700 flex items-center justify-center">
                <Icon name={s.icon} className="w-7 h-7" />
              </span>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center ring-4 ring-white">{i + 1}</span>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
