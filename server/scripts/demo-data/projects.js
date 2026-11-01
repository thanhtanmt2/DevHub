// 6 dự án nội bộ mẫu (do Admin tổ chức): đủ các giai đoạn Lên kế hoạch → Tuyển người → Đang thực hiện → Hoàn thành.
// jobs[].role = khóa vị trí trong jobs.js (dùng lại mô tả/yêu cầu); jobs[].status OPEN | CLOSED (CLOSED = đã đủ người)
// tasks: [tiêu đề, người làm (khóa job), trạng thái, ưu tiên, giờ ước lượng, hạn (ngày so với hôm nay), nhãn, subtask[], bình luận]

const CLIENT_BENEFITS = [
  'Thù lao thanh toán ngay sau khi nghiệm thu từng giai đoạn',
  'Được đánh giá năng lực và cộng điểm vào hồ sơ DevHub',
  'Làm việc từ xa hoàn toàn, họp đồng bộ 2 buổi/tuần',
  'Hỗ trợ kỹ thuật từ đội ngũ quản lý dự án',
  'Có thể được mời tham gia dự án tiếp theo',
];

module.exports = [
  {
    key: 'p_kham', name: 'Hệ thống đặt lịch khám bệnh trực tuyến', status: 'IN_PROGRESS', budget: 85000000, startAgo: 42, endIn: 38,
    description: 'Xây dựng web và ứng dụng cho phép bệnh nhân tìm bác sĩ theo chuyên khoa, đặt/hủy lịch khám, nhận nhắc lịch qua email và SMS. Phía phòng khám có trang quản lý lịch làm việc của bác sĩ và thống kê lượt khám.',
    jobs: [
      { key: 'be', role: 'backend_node', title: 'Backend Node.js Developer (Dự án đặt lịch khám)', budget: 22000000, qty: 1, experience: 'Y2_5', status: 'CLOSED', lead: true },
      { key: 'fe', role: 'frontend', title: 'Frontend React Developer (Dự án đặt lịch khám)', budget: 18000000, qty: 1, experience: 'Y1_2', status: 'CLOSED' },
      { key: 'ux', role: 'uiux', title: 'UI/UX Designer (Dự án đặt lịch khám)', budget: 12000000, qty: 1, experience: 'Y1_2', status: 'CLOSED' },
      { key: 'qa', role: 'qa', title: 'QA Tester (Dự án đặt lịch khám)', budget: 10000000, qty: 1, experience: 'UNDER_1', status: 'CLOSED' },
    ],
    tasks: [
      ['Phân tích yêu cầu và vẽ sơ đồ luồng đặt lịch', 'ux', 'DONE', 'HIGH', 12, -32, ['Design'], ['Phỏng vấn lễ tân và bác sĩ', 'Vẽ user flow trên Figma'], 'Sơ đồ đã khớp với quy trình thực tế của phòng khám.'],
      ['Thiết kế giao diện đặt lịch khám (mobile + web)', 'ux', 'DONE', 'HIGH', 24, -24, ['Design'], ['Wireframe', 'Thiết kế màn hình chính', 'Prototype có thể click'], null],
      ['Xây dựng design system: màu sắc, nút, biểu mẫu', 'ux', 'DONE', 'MEDIUM', 10, -20, ['Design'], [], null],
      ['Thiết kế cơ sở dữ liệu: bệnh nhân, bác sĩ, lịch khám', 'be', 'DONE', 'URGENT', 14, -30, ['Backend'], ['Vẽ ERD', 'Viết migration'], 'ERD đã được duyệt, có thêm bảng chuyên khoa.'],
      ['API đăng ký, đăng nhập và phân quyền bệnh nhân/bác sĩ', 'be', 'DONE', 'HIGH', 20, -22, ['Backend'], ['JWT access/refresh', 'Phân quyền theo vai trò'], null],
      ['API tìm kiếm bác sĩ theo chuyên khoa và lịch trống', 'be', 'REVIEW', 'HIGH', 16, -2, ['Backend', 'Feature'], ['Lọc theo chuyên khoa', 'Lọc theo ngày trống'], 'Em đã nộp, nhờ anh/chị duyệt giúp.'],
      ['API đặt lịch và hủy lịch (kiểm tra trùng giờ)', 'be', 'IN_PROGRESS', 'URGENT', 20, 4, ['Backend', 'Feature'], ['Kiểm tra trùng khung giờ', 'Hủy lịch trước 2 giờ', 'Viết test'], null],
      ['Gửi email/SMS nhắc lịch trước 24 giờ', 'be', 'TODO', 'MEDIUM', 12, 14, ['Backend', 'Feature'], [], null],
      ['Màn hình danh sách bác sĩ và bộ lọc chuyên khoa', 'fe', 'DONE', 'HIGH', 16, -12, ['Frontend'], ['Danh sách + phân trang', 'Bộ lọc chuyên khoa'], null],
      ['Màn hình đặt lịch khám và chọn khung giờ', 'fe', 'IN_PROGRESS', 'HIGH', 20, 6, ['Frontend', 'Feature'], ['Lịch chọn ngày', 'Chọn khung giờ trống', 'Xác nhận đặt lịch'], 'Đang chờ API lịch trống bên backend để ghép.'],
      ['Trang quản lý lịch hẹn của bệnh nhân', 'fe', 'TODO', 'MEDIUM', 14, 12, ['Frontend'], [], null],
      ['Tối ưu tốc độ tải trang danh sách bác sĩ', 'fe', 'TODO', 'LOW', 6, 20, ['Frontend'], [], null],
      ['Viết test case cho luồng đặt lịch', 'qa', 'DONE', 'HIGH', 10, -10, ['Testing'], ['Test case đặt lịch', 'Test case hủy lịch'], null],
      ['Kiểm thử API đăng nhập và phân quyền', 'qa', 'REVIEW', 'MEDIUM', 8, -1, ['Testing'], ['Kiểm thử bằng Postman'], 'Phát hiện 2 lỗi nhỏ, đã ghi lại trong báo cáo.'],
      ['Kiểm thử hồi quy sprint 3', 'qa', 'TODO', 'MEDIUM', 8, 10, ['Testing'], [], null],
    ],
  },
  {
    key: 'p_chi', name: 'Ứng dụng di động theo dõi chi tiêu cá nhân', status: 'COMPLETED', budget: 60000000, startAgo: 125, endIn: -25, actualEndAgo: 22,
    description: 'Ứng dụng Flutter giúp người dùng ghi chép thu chi, đặt ngân sách theo danh mục, nhận cảnh báo khi vượt hạn mức và xem báo cáo theo tuần/tháng. Backend Node.js đồng bộ dữ liệu giữa nhiều thiết bị.',
    jobs: [
      { key: 'mo', role: 'mobile', title: 'Flutter Developer (Ứng dụng chi tiêu)', budget: 24000000, qty: 1, experience: 'Y1_2', status: 'CLOSED', lead: true },
      { key: 'be', role: 'backend_node', title: 'Backend Node.js Developer (Ứng dụng chi tiêu)', budget: 20000000, qty: 1, experience: 'Y1_2', status: 'CLOSED' },
      { key: 'qa', role: 'qa', title: 'QA Tester (Ứng dụng chi tiêu)', budget: 9000000, qty: 1, experience: 'UNDER_1', status: 'CLOSED' },
    ],
    tasks: [
      ['Thiết kế kiến trúc ứng dụng và cấu trúc thư mục Flutter', 'mo', 'DONE', 'HIGH', 10, -100, ['Mobile'], [], null],
      ['Màn hình thêm/sửa giao dịch thu chi', 'mo', 'DONE', 'HIGH', 22, -85, ['Mobile', 'Feature'], ['Form nhập liệu', 'Chọn danh mục'], 'Giao diện mượt, đã kiểm tra trên cả iOS và Android.'],
      ['Biểu đồ thống kê chi tiêu theo tháng', 'mo', 'DONE', 'MEDIUM', 18, -60, ['Mobile'], [], null],
      ['API đồng bộ giao dịch giữa nhiều thiết bị', 'be', 'DONE', 'URGENT', 24, -80, ['Backend'], ['Giải quyết xung đột dữ liệu', 'Phân trang'], null],
      ['API ngân sách và cảnh báo vượt hạn mức', 'be', 'DONE', 'HIGH', 16, -55, ['Backend', 'Feature'], [], 'Thêm thông báo đẩy qua Firebase theo yêu cầu khách hàng.'],
      ['Kiểm thử chức năng và hồi quy toàn bộ ứng dụng', 'qa', 'DONE', 'HIGH', 20, -40, ['Testing'], ['Test trên 5 thiết bị', 'Báo cáo lỗi'], null],
      ['Kiểm thử hiệu năng và dung lượng bộ nhớ', 'qa', 'DONE', 'MEDIUM', 10, -35, ['Testing'], [], null],
      ['Phát hành bản 1.0 lên App Store và Google Play', 'mo', 'DONE', 'URGENT', 12, -28, ['Mobile'], ['Chuẩn bị ảnh và mô tả', 'Gửi duyệt'], null],
    ],
    scores: { mo: [9.0, 'Thành thạo Flutter, giao diện đẹp và bàn giao đúng hạn. Chủ động đề xuất cải tiến trải nghiệm người dùng.'], be: [8.5, 'Thiết kế API rõ ràng, xử lý đồng bộ tốt. Cần chú ý hơn việc viết tài liệu.'], qa: [8.0, 'Kiểm thử cẩn thận, báo cáo lỗi chi tiết và dễ tái hiện.'] },
  },
  {
    key: 'p_chatbot', name: 'Chatbot hỗ trợ luyện tiếng Anh (MVP)', status: 'IN_PROGRESS', budget: 55000000, startAgo: 26, endIn: 40,
    description: 'Xây dựng bản MVP chatbot giúp người học luyện hội thoại tiếng Anh theo chủ đề, tự động sửa lỗi ngữ pháp và đánh giá mức độ trôi chảy. Gồm API Python, giao diện chat web và bộ kiểm thử chất lượng phản hồi.',
    jobs: [
      { key: 'ai', role: 'python', title: 'Python/AI Developer (Chatbot tiếng Anh)', budget: 26000000, qty: 1, experience: 'Y2_5', status: 'CLOSED', lead: true },
      { key: 'fe', role: 'frontend', title: 'Frontend React Developer (Chatbot tiếng Anh)', budget: 16000000, qty: 1, experience: 'Y1_2', status: 'CLOSED' },
      { key: 'qa', role: 'qa', title: 'QA Tester (Chatbot tiếng Anh)', budget: 9000000, qty: 1, experience: 'UNDER_1', status: 'CLOSED' },
    ],
    tasks: [
      ['Thu thập và làm sạch bộ câu hỏi ngữ pháp', 'ai', 'DONE', 'HIGH', 14, -15, ['Backend'], [], null],
      ['Xây dựng API hỏi đáp với mô hình ngôn ngữ', 'ai', 'REVIEW', 'URGENT', 24, -1, ['Backend', 'Feature'], ['Endpoint /chat', 'Lưu lịch sử hội thoại'], 'Đã có bản chạy được, nhờ duyệt trước khi ghép giao diện.'],
      ['Thiết kế luồng hội thoại luyện nói (10 chủ đề)', 'ai', 'IN_PROGRESS', 'HIGH', 16, 7, ['Feature'], ['Chủ đề du lịch', 'Chủ đề công việc'], null],
      ['Giới hạn lượt gọi và bảo vệ API key', 'ai', 'TODO', 'URGENT', 6, 5, ['Backend'], [], null],
      ['Giao diện khung chat và lịch sử hội thoại', 'fe', 'DONE', 'HIGH', 18, -9, ['Frontend'], ['Khung chat', 'Danh sách hội thoại'], null],
      ['Hiển thị gợi ý sửa lỗi ngữ pháp theo thời gian thực', 'fe', 'IN_PROGRESS', 'HIGH', 14, 8, ['Frontend', 'Feature'], [], null],
      ['Trang thống kê tiến độ học của người dùng', 'fe', 'TODO', 'MEDIUM', 12, 18, ['Frontend'], [], null],
      ['Viết bộ test hội thoại mẫu (50 tình huống)', 'qa', 'DONE', 'MEDIUM', 10, -6, ['Testing'], [], null],
      ['Kiểm thử độ chính xác phản hồi của chatbot', 'qa', 'IN_PROGRESS', 'HIGH', 14, 9, ['Testing'], ['Đánh giá 50 tình huống', 'Tổng hợp báo cáo'], null],
      ['Kiểm thử hiệu năng khi 100 người dùng đồng thời', 'qa', 'TODO', 'MEDIUM', 8, 22, ['Testing'], [], null],
    ],
  },
  {
    key: 'p_thoitrang', name: 'Website thương mại điện tử thời trang', status: 'COMPLETED', budget: 48000000, startAgo: 210, endIn: -60, actualEndAgo: 58,
    description: 'Website bán hàng thời trang cho thương hiệu có 5 cửa hàng: danh mục sản phẩm, giỏ hàng, thanh toán, quản lý kho theo chi nhánh và trang quản trị doanh thu.',
    jobs: [
      { key: 'fe', role: 'frontend', title: 'Frontend Developer (Website thời trang)', budget: 17000000, qty: 1, experience: 'Y1_2', status: 'CLOSED', lead: true },
      { key: 'php', role: 'php', title: 'PHP Laravel Developer (Website thời trang)', budget: 19000000, qty: 1, experience: 'Y1_2', status: 'CLOSED' },
      { key: 'ux', role: 'uiux', title: 'UI/UX Designer (Website thời trang)', budget: 10000000, qty: 1, experience: 'UNDER_1', status: 'CLOSED' },
    ],
    tasks: [
      ['Thiết kế giao diện trang chủ, danh mục và chi tiết sản phẩm', 'ux', 'DONE', 'HIGH', 22, -190, ['Design'], [], null],
      ['Thiết kế luồng giỏ hàng và thanh toán', 'ux', 'DONE', 'HIGH', 14, -170, ['Design'], [], null],
      ['Xây dựng trang chủ và danh mục sản phẩm', 'fe', 'DONE', 'HIGH', 24, -150, ['Frontend'], ['Banner và sản phẩm nổi bật', 'Bộ lọc giá, size, màu'], null],
      ['Giỏ hàng, thanh toán và theo dõi đơn hàng', 'fe', 'DONE', 'URGENT', 28, -120, ['Frontend', 'Feature'], [], 'Đã tích hợp cổng thanh toán sandbox để kiểm thử.'],
      ['API sản phẩm, đơn hàng và quản lý kho theo chi nhánh', 'php', 'DONE', 'URGENT', 30, -140, ['Backend'], ['Quản lý tồn kho', 'Chuyển kho giữa chi nhánh'], null],
      ['Trang quản trị: thống kê doanh thu theo ngày/tháng', 'php', 'DONE', 'MEDIUM', 18, -100, ['Backend', 'Feature'], [], null],
      ['Tối ưu SEO và tốc độ tải trang', 'fe', 'DONE', 'MEDIUM', 12, -80, ['Frontend'], [], null],
      ['Triển khai và bàn giao tài liệu cho khách hàng', 'php', 'DONE', 'HIGH', 10, -62, ['Backend'], ['Triển khai lên máy chủ', 'Viết tài liệu hướng dẫn'], null],
    ],
    scores: { fe: [9.5, 'Rất chuyên nghiệp: giao diện tinh tế, tối ưu tốc độ tốt, luôn báo cáo tiến độ đều đặn.'], php: [8.0, 'Hoàn thành đầy đủ chức năng, cần cải thiện thêm về kiểm thử tự động.'], ux: [8.5, 'Thiết kế sáng tạo, bàn giao file Figma gọn gàng, dễ triển khai.'] },
  },
  {
    key: 'p_tuyensinh', name: 'Cổng thông tin tuyển sinh trực tuyến', status: 'RECRUITING', budget: 70000000, startAgo: 6, endIn: 75,
    description: 'Cổng đăng ký xét tuyển trực tuyến cho trường cao đẳng: nộp hồ sơ, tra cứu kết quả, thanh toán lệ phí và trang quản trị dành cho phòng đào tạo.',
    jobs: [
      { key: 'fs1', role: 'fullstack', title: 'Fullstack Developer (Cổng tuyển sinh) – Phần hồ sơ', budget: 24000000, qty: 1, experience: 'Y1_2', status: 'OPEN', deadlineIn: 12 },
      { key: 'fs2', role: 'fullstack', title: 'Fullstack Developer (Cổng tuyển sinh) – Phần quản trị', budget: 22000000, qty: 1, experience: 'Y1_2', status: 'OPEN', deadlineIn: 15 },
      { key: 'ux', role: 'uiux', title: 'UI/UX Designer (Cổng tuyển sinh)', budget: 12000000, qty: 1, experience: 'UNDER_1', status: 'OPEN', deadlineIn: 10 },
      { key: 'qa', role: 'qa', title: 'QA Tester (Cổng tuyển sinh)', budget: 9000000, qty: 2, experience: 'NONE', status: 'OPEN', deadlineIn: 20 },
    ],
    tasks: [],
  },
  {
    key: 'p_dashboard', name: 'Dashboard phân tích dữ liệu bán lẻ', status: 'PLANNING', budget: 40000000, startAgo: 1, endIn: 90,
    description: 'Xây dựng kho dữ liệu nhỏ và bộ dashboard giúp chuỗi bán lẻ theo dõi doanh thu, tồn kho và hiệu quả khuyến mãi theo thời gian thực.',
    jobs: [
      { key: 'da', role: 'data_ai', title: 'Data Analyst (Dashboard bán lẻ)', budget: 20000000, qty: 1, experience: 'Y1_2', status: 'OPEN', deadlineIn: 25 },
      { key: 'fe', role: 'frontend', title: 'Frontend Developer (Dashboard bán lẻ)', budget: 15000000, qty: 1, experience: 'Y1_2', status: 'OPEN', deadlineIn: 25 },
    ],
    tasks: [],
  },
];

module.exports.CLIENT_BENEFITS = CLIENT_BENEFITS;
