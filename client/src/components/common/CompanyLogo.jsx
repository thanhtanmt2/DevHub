import SafeImage from '@/components/common/SafeImage';

// Logo công ty; chưa có logo hoặc file ảnh lỗi thì hiện chữ cái đầu của tên công ty
export default function CompanyLogo({ company, className = 'w-12 h-12 text-lg' }) {
  const initial = (company?.name || '?').trim().charAt(0).toUpperCase();
  return (
    <SafeImage
      src={company?.logo_url}
      alt={company?.name || ''}
      className={`${className} rounded-xl object-contain border border-gray-100 bg-white flex-shrink-0`}
      fallback={
        <span className={`${className} rounded-xl bg-primary-50 text-primary-700 font-bold flex items-center justify-center flex-shrink-0`}>
          {initial}
        </span>
      }
    />
  );
}
