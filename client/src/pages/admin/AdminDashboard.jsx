import { useAuth } from '@/contexts/AuthContext';
export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-6">Xin chào quản trị viên, {user?.full_name}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:'Tổng người dùng',value:'0'},{label:'Tin tuyển dụng',value:'0'},{label:'Dự án nội bộ',value:'0'},{label:'Chi phí trả lương',value:'0đ'}]
          .map((item,i) => (
            <div key={i} className="card"><p className="text-gray-500 text-sm">{item.label}</p><p className="text-2xl font-bold text-primary-600 mt-1">{item.value}</p></div>
          ))}
      </div>
    </div>
  );
}
