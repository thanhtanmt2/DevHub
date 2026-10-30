// 12 doanh nghiệp mẫu (hư cấu). `hr` là người phụ trách tuyển dụng, cũng là chủ tài khoản nhà tuyển dụng.
// verification: VERIFIED | PENDING | REJECTED (để trang Admin có đủ trạng thái)
module.exports = [
  {
    key: 'saoviet', name: 'Công ty TNHH Giải pháp Phần mềm Sao Việt', tax: '0312456781', city: 'TP. Hồ Chí Minh',
    address: 'Tòa nhà Viettel Complex, 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 58,
    hr: 'Nguyễn Thu Hà',
    description: 'Sao Việt chuyên xây dựng phần mềm quản trị doanh nghiệp (ERP, CRM, HRM) cho hơn 300 khách hàng trong nước và khu vực Đông Nam Á. Đội ngũ 180 kỹ sư, làm việc theo Scrum với chu kỳ phát hành 2 tuần.',
  },
  {
    key: 'camtu', name: 'Công ty Cổ phần Công nghệ Cẩm Tú', tax: '0108765432', city: 'Hà Nội',
    address: 'Tầng 12, Tòa nhà Handico, Phạm Hùng, Nam Từ Liêm, Hà Nội', verification: 'VERIFIED', daysAgo: 55,
    hr: 'Trần Minh Châu',
    description: 'Cẩm Tú phát triển nền tảng thương mại điện tử và thanh toán trực tuyến cho các chuỗi bán lẻ. Hệ thống xử lý hơn 2 triệu đơn hàng mỗi tháng, ưu tiên kiến trúc microservices và tối ưu hiệu năng.',
  },
  {
    key: 'tana', name: 'Công ty TNHH Dữ liệu và Trí tuệ nhân tạo Tân Á', tax: '0314789520', city: 'TP. Hồ Chí Minh',
    address: 'Lầu 5, 72 Lê Thánh Tôn, Quận 1, TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 52,
    hr: 'Lê Hoàng Yến',
    description: 'Tân Á cung cấp giải pháp phân tích dữ liệu, chatbot và thị giác máy tính cho ngân hàng, bảo hiểm và bán lẻ. Đội R&D hợp tác thường xuyên với các trường đại học để đưa nghiên cứu vào sản phẩm.',
  },
  {
    key: 'ronvang', name: 'Công ty Cổ phần Fintech Rồng Vàng', tax: '0109234871', city: 'Hà Nội',
    address: '45 Lê Văn Lương, Thanh Xuân, Hà Nội', verification: 'VERIFIED', daysAgo: 49,
    hr: 'Phạm Quốc Bảo',
    description: 'Rồng Vàng vận hành ví điện tử và cổng thanh toán với hơn 1,5 triệu người dùng. Chúng tôi đề cao bảo mật, độ ổn định 99,95% và văn hóa code review nghiêm túc.',
  },
  {
    key: 'canhdieu', name: 'Công ty TNHH Thương mại điện tử Cánh Diều', tax: '0313567890', city: 'TP. Hồ Chí Minh',
    address: '18 Phan Xích Long, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 45,
    hr: 'Võ Ngọc Mai',
    description: 'Cánh Diều là sàn thương mại điện tử chuyên hàng gia dụng và mẹ bé, tăng trưởng 3 lần trong 2 năm. Đội sản phẩm làm việc sát với vận hành để ra tính năng mới mỗi tuần.',
  },
  {
    key: 'bienxanh', name: 'Công ty Cổ phần Phần mềm Biển Xanh', tax: '0401234567', city: 'Đà Nẵng',
    address: '36 Bạch Đằng, Hải Châu, Đà Nẵng', verification: 'VERIFIED', daysAgo: 41,
    hr: 'Đặng Thị Hồng Nhung',
    description: 'Biển Xanh là công ty gia công phần mềm cho thị trường Nhật Bản và Hàn Quốc, có văn phòng tại Đà Nẵng. Nhân viên được đào tạo tiếng Nhật miễn phí và có cơ hội onsite.',
  },
  {
    key: 'anhduong', name: 'Công ty TNHH Công nghệ Giáo dục Ánh Dương', tax: '0110345672', city: 'Hà Nội',
    address: 'Số 8 Tôn Thất Thuyết, Cầu Giấy, Hà Nội', verification: 'VERIFIED', daysAgo: 38,
    hr: 'Bùi Thanh Tâm',
    description: 'Ánh Dương xây dựng nền tảng học trực tuyến cho học sinh phổ thông với 800.000 tài khoản đang hoạt động. Môi trường trẻ, khuyến khích thử nghiệm và học hỏi nhanh.',
  },
  {
    key: 'giodong', name: 'Công ty Cổ phần Logistics Thông minh Gió Đông', tax: '0200987654', city: 'Hải Phòng',
    address: '21 Lạch Tray, Ngô Quyền, Hải Phòng', verification: 'VERIFIED', daysAgo: 34,
    hr: 'Hoàng Văn Thắng',
    description: 'Gió Đông số hóa chuỗi cung ứng: quản lý kho, điều phối vận tải và theo dõi đơn hàng thời gian thực cho các doanh nghiệp xuất nhập khẩu khu vực phía Bắc.',
  },
  {
    key: 'hongnac', name: 'Công ty TNHH Mobile Studio Hồng Hạc', tax: '0315678904', city: 'TP. Hồ Chí Minh',
    address: 'Lầu 3, 123 Nguyễn Thị Minh Khai, Quận 3, TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 30,
    hr: 'Ngô Khánh Linh',
    description: 'Hồng Hạc là studio phát triển ứng dụng di động (Flutter, React Native) cho các thương hiệu F&B và du lịch, với hơn 40 ứng dụng đã phát hành trên App Store và Google Play.',
  },
  {
    key: 'lachong', name: 'Công ty Cổ phần Y tế số Lạc Hồng', tax: '1801234560', city: 'Cần Thơ',
    address: '15 Trần Hưng Đạo, Ninh Kiều, Cần Thơ', verification: 'VERIFIED', daysAgo: 27,
    hr: 'Lý Mỹ Duyên',
    description: 'Lạc Hồng phát triển hệ thống hồ sơ sức khỏe điện tử và đặt lịch khám cho bệnh viện, phòng khám khu vực Đồng bằng sông Cửu Long. Sản phẩm phục vụ trực tiếp hàng chục nghìn bệnh nhân.',
  },
  {
    key: 'longvan', name: 'Công ty TNHH Giải pháp An ninh mạng Long Vân', tax: '0111456780', city: 'Hà Nội',
    address: 'Tầng 7, 91 Láng Hạ, Đống Đa, Hà Nội', verification: 'PENDING', daysAgo: 4,
    hr: 'Vũ Đình Khôi',
    description: 'Long Vân cung cấp dịch vụ đánh giá an toàn thông tin, kiểm thử xâm nhập và giám sát an ninh cho doanh nghiệp vừa và nhỏ.',
  },
  {
    key: 'bachduong', name: 'Công ty TNHH Phần mềm Bạch Dương', tax: '0316789012', city: 'TP. Hồ Chí Minh',
    address: '27 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', verification: 'REJECTED', daysAgo: 12,
    hr: 'Đỗ Tuấn Kiệt',
    description: 'Công ty phần mềm nhỏ nhận làm website và ứng dụng theo yêu cầu.',
  },
];
