// Mẫu hồ sơ ứng viên: tên, nhóm chuyên môn (archetype), kỹ năng, việc đã làm...

const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const NAM = {
  dem: ['Văn', 'Hữu', 'Quốc', 'Minh', 'Đức', 'Thành', 'Gia', 'Tuấn', 'Hoàng', 'Anh'],
  ten: ['Khoa', 'Long', 'Phúc', 'Hải', 'Nam', 'Bảo', 'Huy', 'Dũng', 'Tín', 'Khang', 'Thịnh', 'Sơn', 'Hiếu', 'Trung', 'Quân', 'Đạt', 'Kiên', 'Việt', 'Tài', 'Nhân'],
};
const NU = {
  dem: ['Thị', 'Ngọc', 'Thu', 'Kim', 'Phương', 'Thanh', 'Bảo', 'Hồng', 'Mai', 'Diễm'],
  ten: ['Linh', 'Trang', 'Hà', 'Vy', 'Ngân', 'Thảo', 'Nhi', 'Chi', 'Hương', 'Yến', 'Quỳnh', 'My', 'Uyên', 'Lan', 'Trâm', 'Tiên', 'Nga', 'Ánh', 'Hạnh', 'Oanh'],
};

// Nơi ở (tỉ lệ theo thực tế: TP.HCM và Hà Nội chiếm đa số)
const CITIES = [
  'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Hà Nội', 'Hà Nội', 'Hà Nội',
  'Đà Nẵng', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai',
];

// Số lượng ứng viên theo từng nhóm
const ARCHETYPES = {
  frontend: {
    count: 5, titles: ['Frontend Developer', 'React Developer', 'Web Developer (React)'],
    core: ['React', 'JavaScript', 'HTML/CSS'], extra: ['TypeScript', 'Tailwind CSS', 'Redux', 'Git', 'Figma', 'REST API'],
    focus: 'giao diện web với React', roles: ['Frontend Developer', 'Web Developer'],
    tasks: ['Xây dựng giao diện responsive theo thiết kế Figma', 'Tích hợp REST API và quản lý state bằng Redux', 'Tối ưu tốc độ tải trang và hiển thị trên mobile', 'Viết component dùng lại và review code cho thành viên mới'],
  },
  backend_node: {
    count: 4, titles: ['Backend Developer (Node.js)', 'Node.js Developer'],
    core: ['Node.js', 'Express.js', 'PostgreSQL'], extra: ['MongoDB', 'Redis', 'Docker', 'REST API', 'TypeScript', 'NestJS', 'Git'],
    focus: 'API và dịch vụ backend với Node.js', roles: ['Backend Developer', 'Node.js Developer'],
    tasks: ['Thiết kế và phát triển RESTful API cho web và mobile', 'Thiết kế cơ sở dữ liệu, tối ưu truy vấn PostgreSQL', 'Xây dựng xác thực JWT và phân quyền theo vai trò', 'Đóng gói và triển khai dịch vụ bằng Docker'],
  },
  java: {
    count: 4, titles: ['Java Developer', 'Java Spring Boot Developer'],
    core: ['Java', 'Spring Boot', 'MySQL'], extra: ['PostgreSQL', 'Microservices', 'Docker', 'REST API', 'RabbitMQ', 'Git'],
    focus: 'hệ thống backend Java Spring Boot', roles: ['Java Developer', 'Backend Developer'],
    tasks: ['Phát triển các dịch vụ Spring Boot theo kiến trúc microservices', 'Viết unit test, integration test cho các module nghiệp vụ', 'Tối ưu truy vấn và xử lý đồng thời cho nghiệp vụ giao dịch', 'Tham gia phân tích yêu cầu và ước lượng công việc theo sprint'],
  },
  php: {
    count: 3, titles: ['PHP Laravel Developer', 'Web Developer (PHP)'],
    core: ['PHP', 'Laravel', 'MySQL'], extra: ['Redis', 'Vue.js', 'REST API', 'Git', 'Docker'],
    focus: 'website và hệ thống quản lý bằng Laravel', roles: ['PHP Developer', 'Web Developer'],
    tasks: ['Phát triển module bán hàng và quản lý kho bằng Laravel', 'Tích hợp cổng thanh toán và đơn vị vận chuyển', 'Tối ưu truy vấn MySQL và sử dụng cache Redis', 'Sửa lỗi, nâng cấp tính năng theo phản hồi của vận hành'],
  },
  python: {
    count: 3, titles: ['Python Developer', 'Backend Developer (Python)'],
    core: ['Python', 'Django', 'PostgreSQL'], extra: ['REST API', 'Docker', 'Redis', 'AWS', 'Git', 'SQL'],
    focus: 'backend Python và xử lý dữ liệu', roles: ['Python Developer', 'Backend Developer'],
    tasks: ['Xây dựng API Django REST framework cho ứng dụng nội bộ', 'Viết script thu thập và làm sạch dữ liệu định kỳ', 'Thiết kế cơ sở dữ liệu và tối ưu truy vấn PostgreSQL', 'Triển khai ứng dụng lên AWS bằng Docker'],
  },
  data_ai: {
    count: 3, titles: ['Data Analyst', 'Data Scientist (Junior)', 'AI/ML Engineer'],
    core: ['Python', 'SQL', 'Pandas'], extra: ['Power BI', 'Machine Learning', 'TensorFlow', 'Git'],
    focus: 'phân tích dữ liệu và học máy', roles: ['Data Analyst', 'Data Engineer'],
    tasks: ['Làm sạch, phân tích dữ liệu bán hàng và lập báo cáo định kỳ', 'Xây dựng mô hình dự báo nhu cầu bằng Scikit-learn', 'Thiết kế dashboard Power BI cho ban điều hành', 'Triển khai mô hình phân loại văn bản tiếng Việt'],
  },
  qa: {
    count: 4, titles: ['QA Engineer', 'Software Tester', 'QA Automation Engineer'],
    core: ['Manual Testing', 'Jira', 'SQL'], extra: ['Selenium', 'Cypress', 'Postman', 'Agile/Scrum', 'Git'],
    focus: 'kiểm thử phần mềm', roles: ['QA Engineer', 'Software Tester'],
    tasks: ['Phân tích yêu cầu, thiết kế test case và thực hiện kiểm thử hồi quy', 'Báo cáo và theo dõi lỗi trên Jira cùng đội phát triển', 'Kiểm thử API bằng Postman, viết kịch bản tự động bằng Selenium', 'Tham gia sprint planning và đánh giá tiêu chí hoàn thành'],
  },
  devops: {
    count: 3, titles: ['DevOps Engineer', 'Cloud Engineer'],
    core: ['Docker', 'Linux', 'CI/CD'], extra: ['Kubernetes', 'AWS', 'Azure', 'GCP', 'Git'],
    focus: 'hạ tầng đám mây và CI/CD', roles: ['DevOps Engineer', 'System Engineer'],
    tasks: ['Xây dựng pipeline CI/CD bằng GitHub Actions và GitLab CI', 'Quản lý hạ tầng AWS bằng Terraform', 'Thiết lập giám sát với Prometheus, Grafana và cảnh báo sự cố', 'Tối ưu chi phí hạ tầng và sao lưu dữ liệu định kỳ'],
  },
  mobile: {
    count: 3, titles: ['Mobile Developer (Flutter)', 'React Native Developer', 'Mobile Developer'],
    core: ['Flutter', 'Firebase', 'REST API'], extra: ['React Native', 'Kotlin', 'Swift', 'Git'],
    focus: 'ứng dụng di động đa nền tảng', roles: ['Mobile Developer', 'Flutter Developer'],
    tasks: ['Phát triển ứng dụng di động bằng Flutter cho iOS và Android', 'Tích hợp thông báo đẩy, thanh toán và đăng nhập mạng xã hội', 'Tối ưu hiệu năng và dung lượng ứng dụng', 'Phát hành ứng dụng lên App Store và Google Play'],
  },
  uiux: {
    count: 2, titles: ['UI/UX Designer', 'Product Designer'],
    core: ['Figma', 'UI/UX Design'], extra: ['HTML/CSS'],
    focus: 'thiết kế trải nghiệm người dùng', roles: ['UI/UX Designer', 'Graphic Designer'],
    tasks: ['Nghiên cứu người dùng, xây dựng user flow và wireframe', 'Thiết kế giao diện web, mobile và design system trên Figma', 'Bàn giao thiết kế và kiểm tra chất lượng sau triển khai', 'Thực hiện kiểm thử khả năng sử dụng với người dùng thật'],
  },
  fullstack: {
    count: 4, titles: ['Fullstack Developer', 'Fullstack Web Developer'],
    core: ['React', 'Node.js', 'PostgreSQL'], extra: ['TypeScript', 'MongoDB', 'Docker', 'Git', 'REST API', 'Express.js'],
    focus: 'ứng dụng web fullstack (React & Node.js)', roles: ['Fullstack Developer', 'Web Developer'],
    tasks: ['Phát triển tính năng từ giao diện React đến API Node.js và cơ sở dữ liệu', 'Xây dựng hệ thống quản lý đơn hàng và báo cáo doanh thu', 'Triển khai ứng dụng bằng Docker lên máy chủ', 'Phối hợp trực tiếp với bộ phận nghiệp vụ để làm rõ yêu cầu'],
  },
  dotnet: {
    count: 2, titles: ['.NET Developer', 'C# Developer'],
    core: ['C#', '.NET Core', 'SQL'], extra: ['Azure', 'REST API', 'Git'],
    focus: 'ứng dụng doanh nghiệp bằng .NET Core', roles: ['.NET Developer', 'Software Engineer'],
    tasks: ['Phát triển Web API bằng ASP.NET Core và Entity Framework', 'Viết stored procedure và tối ưu truy vấn SQL Server', 'Tích hợp hệ thống nội bộ qua REST API', 'Triển khai ứng dụng trên Azure DevOps'],
  },
};

// Công ty ứng viên từng làm (hư cấu, một phần là các doanh nghiệp mẫu trong hệ thống)
const PAST_COMPANIES = [
  'Công ty TNHH Phần mềm Hưng Thịnh', 'Công ty Cổ phần Giải pháp Số Nam Phát', 'Công ty TNHH Outsourcing Đại Nam',
  'Công ty TNHH Công nghệ An Bình', 'Startup Mây Tre', 'Công ty Cổ phần Phần mềm Tam Giác',
  'Công ty TNHH Giải pháp Phần mềm Sao Việt', 'Công ty TNHH Mobile Studio Hồng Hạc', 'Công ty Cổ phần Công nghệ Cẩm Tú',
];

const PERSONAL_PROJECTS = [
  ['Website đặt phòng homestay', 'Đồ án môn học: tìm kiếm, đặt phòng và thanh toán trực tuyến'],
  ['Ứng dụng quản lý chi tiêu cá nhân', 'Dự án cá nhân theo dõi thu chi, thống kê theo tháng'],
  ['Hệ thống quản lý thư viện trường học', 'Đồ án tốt nghiệp: mượn/trả sách, thống kê độc giả'],
  ['Trang web bán hàng thời trang', 'Dự án cá nhân với giỏ hàng, thanh toán và trang quản trị'],
  ['Chatbot hỏi đáp tuyển sinh', 'Đồ án: chatbot trả lời câu hỏi thường gặp về tuyển sinh đại học'],
];

const INTRO_OPENERS = [
  'Mình là', 'Hiện mình đang làm việc với vai trò', 'Mình có định hướng phát triển nghề nghiệp ở vị trí',
];
const INTRO_CLOSERS = [
  'Quen làm việc theo Agile/Scrum, thích học hỏi công nghệ mới và chia sẻ kiến thức với đồng đội.',
  'Mong muốn tham gia các dự án thực tế để nâng cao kỹ năng và đóng góp giá trị cho đội nhóm.',
  'Có tinh thần trách nhiệm, giao tiếp tốt và sẵn sàng làm việc từ xa hoặc linh hoạt thời gian.',
  'Đang tìm kiếm các dự án thời vụ để tích lũy kinh nghiệm và hoàn thiện hồ sơ năng lực.',
];

const COVER_LETTERS = [
  'Chào anh/chị, em đã đọc kỹ mô tả công việc và thấy kỹ năng của mình phù hợp với vị trí này. Em đính kèm hồ sơ và rất mong có cơ hội trao đổi thêm. Em xin cảm ơn.',
  'Kính gửi nhà tuyển dụng, tôi có kinh nghiệm thực tế với các công nghệ trong yêu cầu và mong muốn được đóng góp cho đội ngũ. Rất mong nhận được phản hồi từ quý công ty.',
  'Em chào anh/chị. Em là người ham học hỏi, từng tham gia một số dự án có công nghệ tương tự yêu cầu. Em sẵn sàng làm bài kiểm tra hoặc phỏng vấn vào thời gian anh/chị thuận tiện.',
  'Xin chào công ty, tôi quan tâm đến vị trí này vì môi trường và sản phẩm của công ty. Tôi có thể bắt đầu làm việc sau 2 tuần kể từ khi nhận offer.',
  '',
];

module.exports = { HO, NAM, NU, CITIES, ARCHETYPES, PAST_COMPANIES, PERSONAL_PROJECTS, INTRO_OPENERS, INTRO_CLOSERS, COVER_LETTERS };
