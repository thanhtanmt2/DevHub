import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';

const formatCurrency = (n) =>
  n ? `${new Intl.NumberFormat('vi-VN').format(n)}đ` : '0đ';

// Helper: tải file blob về máy
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function StatCard({ label, value, icon, color = 'primary', sub }) {
  const colorMap = {
    primary: 'bg-primary-50 border-primary-100 text-primary-700',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    purple: 'bg-primary-50 border-primary-100 text-primary-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    red: 'bg-red-50 border-red-100 text-red-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0"><Icon name={icon} className="w-5 h-5" /></span>
        {/* Số dài (vd: số tiền) dùng cỡ chữ nhỏ hơn để không đè lên icon */}
        <span className={`font-bold ml-2 ${String(value ?? '').length > 8 ? 'text-2xl' : 'text-3xl'}`}>{value ?? '—'}</span>
      </div>
      <p className="text-sm font-semibold">{label}</p>
      {sub && <p className="text-xs opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StatsPage() {
  const [exporting, setExporting] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });

  const stats = data?.data?.data;

  const handleExport = async (type) => {
    setExporting(type);
    try {
      let res;
      let filename;
      if (type === 'payments') {
        res = await adminApi.exportPayments();
        filename = `bao-cao-thanh-toan-${new Date().toISOString().slice(0, 10)}.xlsx`;
      } else if (type === 'evaluations') {
        res = await adminApi.exportEvaluations();
        filename = `bao-cao-danh-gia-${new Date().toISOString().slice(0, 10)}.xlsx`;
      } else {
        res = await adminApi.exportApplications();
        filename = `bao-cao-ung-tuyen-${new Date().toISOString().slice(0, 10)}.xlsx`;
      }
      downloadBlob(res.data, filename);
      toast.success(`Đã xuất file ${filename}`);
    } catch (err) {
      toast.error('Không thể xuất báo cáo. Vui lòng thử lại.');
    } finally {
      setExporting('');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageBanner compact icon="chart" title="Thống kê & Báo cáo" subtitle="Tổng quan hệ thống và xuất báo cáo Excel" />

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tổng quan hệ thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard icon="users" label="Tổng người dùng" value={stats?.total_users} color="primary" />
          <StatCard icon="briefcase" label="Tin tuyển dụng" value={stats?.total_jobs} color="blue" />
          <StatCard icon="folder" label="Dự án nội bộ" value={stats?.total_projects} color="purple" />
          <StatCard icon="mail" label="Đơn ứng tuyển (7 ngày)" value={stats?.recent_applications} color="amber" sub="Trong 7 ngày gần nhất" />
          <StatCard
            icon="cash"
            label="Tổng thù lao đã thanh toán"
            value={formatCurrency(stats?.total_payout)}
            color="emerald"
            sub="Trạng thái PAID"
          />
          {/* API trả số thanh toán theo trạng thái trong stats.payments (trước đây đọc nhầm khóa nên thẻ này không bao giờ hiện) */}
          {stats?.payments && (
            <StatCard
              icon="clock"
              label="Thanh toán chờ xử lý"
              value={(stats.payments.pending || 0) + (stats.payments.processing || 0)}
              color="amber"
              sub={`${stats.payments.processing || 0} đang xử lý`}
            />
          )}
          {stats?.total_applications != null && (
            <StatCard icon="clipboard" label="Tổng đơn ứng tuyển" value={stats.total_applications} color="blue" />
          )}
          {stats?.total_project_applications != null && (
            <StatCard icon="trending" label="Đơn ứng tuyển dự án" value={stats.total_project_applications} color="purple" />
          )}
        </div>
      </div>

      {/* Export section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Kết xuất báo cáo Excel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Payments report */}
          <div className="card border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <IconBadge name="card" tone="emerald" shape="square" />
              <div>
                <h3 className="font-semibold text-gray-800">Báo cáo Thanh toán</h3>
                <p className="text-xs text-gray-400">Tất cả giao dịch thù lao</p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mb-4">
              <li>• Ứng viên, email, workspace</li>
              <li>• Số tiền, phương thức, mã giao dịch</li>
              <li>• Trạng thái và ngày thanh toán</li>
            </ul>
            <button
              onClick={() => handleExport('payments')}
              disabled={!!exporting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2"
            >
              {exporting === 'payments' ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xuất...</>
              ) : (
                <><Icon name="table" className="w-4 h-4" /> Xuất Excel (.xlsx)</>
              )}
            </button>
          </div>

          {/* Evaluations report */}
          <div className="card border-2 border-primary-100 hover:border-primary-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <IconBadge name="star" tone="purple" shape="square" />
              <div>
                <h3 className="font-semibold text-gray-800">Báo cáo Đánh giá năng lực</h3>
                <p className="text-xs text-gray-400">Điểm năng lực ứng viên</p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mb-4">
              <li>• Ứng viên, workspace/dự án</li>
              <li>• Điểm đánh giá (0–10)</li>
              <li>• Nhận xét và ngày đánh giá</li>
            </ul>
            <button
              onClick={() => handleExport('evaluations')}
              disabled={!!exporting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2"
            >
              {exporting === 'evaluations' ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xuất...</>
              ) : (
                <><Icon name="table" className="w-4 h-4" /> Xuất Excel (.xlsx)</>
              )}
            </button>
          </div>

          {/* Applications report */}
          <div className="card border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <IconBadge name="mail" tone="blue" shape="square" />
              <div>
                <h3 className="font-semibold text-gray-800">Báo cáo Ứng tuyển</h3>
                <p className="text-xs text-gray-400">Tất cả đơn ứng tuyển việc làm</p>
              </div>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mb-4">
              <li>• Ứng viên, email</li>
              <li>• Vị trí & công ty tuyển dụng</li>
              <li>• Trạng thái và ngày nộp</li>
            </ul>
            <button
              onClick={() => handleExport('applications')}
              disabled={!!exporting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              {exporting === 'applications' ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang xuất...</>
              ) : (
                <><Icon name="table" className="w-4 h-4" /> Xuất Excel (.xlsx)</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1"><Icon name="info" className="w-4 h-4 mr-1" />Hướng dẫn sử dụng</p>
        <ul className="space-y-1 text-xs text-blue-600">
          <li>• File Excel xuất ra tương thích với Microsoft Excel, Google Sheets và LibreOffice</li>
          <li>• Dữ liệu bao gồm toàn bộ lịch sử (không có giới hạn thời gian)</li>
          <li>• Các cột được đánh màu theo trạng thái (xanh = hoàn thành, vàng = đang xử lý, đỏ = thất bại)</li>
          <li>• Bảng tính có Auto-filter và Freeze header để dễ thao tác</li>
        </ul>
      </div>
    </div>
  );
}
