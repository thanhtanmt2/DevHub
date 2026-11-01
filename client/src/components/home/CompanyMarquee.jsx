import { Link } from 'react-router-dom';
import CompanyLogo, { brandName } from '@/components/common/CompanyLogo';

// Dải logo doanh nghiệp tự chạy ngang (dừng khi rê chuột); danh sách được lặp 2 lần để vòng lặp liền mạch.
// Bản lặp chỉ để hiển thị nên ẩn khỏi trình đọc màn hình và không cho focus bằng bàn phím.
export default function CompanyMarquee({ companies = [], loading = false }) {
  // Đang tải: giữ chỗ bằng khung chờ cùng chiều cao để trang không bị đẩy xuống khi dữ liệu về
  if (loading) {
    return (
      <section className="bg-white border-y border-slate-100" aria-hidden="true">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-4 w-64 max-w-full rounded mx-auto" />
          <div className="mt-5 flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-[66px] w-[250px] flex-shrink-0 rounded-2xl" />)}
          </div>
        </div>
      </section>
    );
  }
  if (!companies.length) return null;
  const items = [...companies, ...companies];

  return (
    <section className="bg-white border-y border-slate-100" aria-label="Doanh nghiệp đang tuyển dụng">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-sm font-semibold text-slate-500">Doanh nghiệp đang tuyển dụng trên DevHub</p>
        <div className="marquee mt-5 overflow-hidden fade-edges">
          <ul className="flex w-max animate-marquee">
            {items.map((c, i) => {
              const copy = i >= companies.length;
              return (
                <li key={`${c.id}-${i}`} className="pr-4" aria-hidden={copy || undefined}>
                  <Link
                    to={`/jobs?keyword=${encodeURIComponent(c.name)}`}
                    tabIndex={copy ? -1 : undefined}
                    className="flex items-center gap-3 w-[250px] p-2.5 pr-4 rounded-2xl bg-white border border-slate-200 transition-all duration-300 hover:border-primary-300 hover:shadow-soft hover:-translate-y-0.5"
                  >
                    <CompanyLogo company={c} className="w-12 h-12 text-base" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{brandName(c.name)}</span>
                      <span className="block mt-0.5 text-xs font-medium text-primary-700">{c.open_jobs} việc làm đang mở</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
