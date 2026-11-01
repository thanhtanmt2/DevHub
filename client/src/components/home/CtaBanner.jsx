import Icon from '@/components/common/Icon';
import CompanyLogo from '@/components/common/CompanyLogo';
import { useAuth } from '@/contexts/AuthContext';
import Reveal from '@/components/home/Reveal';

// Khối kêu gọi đăng ký cuối trang (chỉ hiện với khách). Nền sáng để không chồng thêm một mảng xanh lớn nữa
// (hero và footer đã là hai mảng màu thương hiệu); uy tín thể hiện bằng logo các doanh nghiệp đã xác thực.
export default function CtaBanner({ companies = [], total = 0 }) {
  const { openRegisterModal } = useAuth();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-20 lg:pb-24">
      <Reveal className="rounded-3xl bg-gradient-to-b from-primary-50 to-white border border-primary-100 shadow-soft px-6 py-14 sm:px-12 text-center">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
          <Icon name="globeAlt" className="w-4 h-4" />Cùng kết nối trên DevHub
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">Sẵn sàng cho bước tiến tiếp theo?</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto text-balance">
          Tạo hồ sơ năng lực để nhận việc làm phù hợp, hoặc đăng tin để tìm đúng nhân sự IT cho doanh nghiệp của bạn.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => openRegisterModal('CANDIDATE')} className="btn-primary px-7 py-3 text-base">
            Tôi là ứng viên<Icon name="arrowRight" className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => openRegisterModal('EMPLOYER')} className="btn-secondary px-7 py-3 text-base">
            Tôi là nhà tuyển dụng
          </button>
        </div>

        {companies.length > 0 && (
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex -space-x-1.5">
              {companies.slice(0, 6).map((c) => (
                <span key={c.id} className="rounded-xl ring-2 ring-white shadow-sm">
                  <CompanyLogo company={c} className="w-11 h-11 text-sm" />
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">{total || companies.length}</strong> doanh nghiệp đã xác thực đang tuyển dụng trên DevHub
            </p>
          </div>
        )}
      </Reveal>
    </section>
  );
}
