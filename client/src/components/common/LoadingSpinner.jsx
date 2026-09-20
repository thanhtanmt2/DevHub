export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizes[size]} border-2 border-primary-600 border-t-transparent rounded-full animate-spin`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-center p-4">{spinner}</div>;
}
