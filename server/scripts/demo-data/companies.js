// 12 doanh nghiệp mẫu: 10 doanh nghiệp công nghệ thật (tên, logo, website, mô tả ngắn công khai; tin tuyển dụng / lương / hồ sơ là DỮ LIỆU MẪU)
// + 2 công ty hư cấu để có trạng thái PENDING / REJECTED cho trang Admin (không gán các trạng thái đó cho công ty thật).
// Logo: server/uploads/images/demo-logo-<key>.png. `hr` là người phụ trách tuyển dụng, cũng là chủ tài khoản nhà tuyển dụng.
// verification: VERIFIED | PENDING | REJECTED (để trang Admin có đủ trạng thái)
module.exports = [
  {
    key: 'saoviet', name: 'NashTech', tax: '0312456781', city: 'TP. Hồ Chí Minh',
    address: 'TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 58,
    website: 'https://www.nashtechglobal.com',
    hr: 'Nguyễn Thu Hà',
    description: 'NashTech là công ty công nghệ cung cấp dịch vụ phát triển phần mềm và chuyển đổi số cho khách hàng trong nước và quốc tế, với đội ngũ kỹ sư tại Việt Nam.',
  },
  {
    key: 'camtu', name: 'VNPAY', tax: '0108765432', city: 'Hà Nội',
    address: 'Hà Nội', verification: 'VERIFIED', daysAgo: 55,
    website: 'https://vnpay.vn',
    hr: 'Trần Minh Châu',
    description: 'VNPAY là công ty công nghệ tài chính, cung cấp giải pháp thanh toán điện tử và thanh toán QR cho ngân hàng, thương nhân và người dùng.',
  },
  {
    key: 'tana', name: 'KMS Technology', tax: '0314789520', city: 'TP. Hồ Chí Minh',
    address: 'TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 52,
    website: 'https://www.kms-technology.com',
    hr: 'Lê Hoàng Yến',
    description: 'KMS Technology là công ty phát triển phần mềm và tư vấn công nghệ, có đội ngũ kỹ sư tại Việt Nam phục vụ khách hàng toàn cầu.',
  },
  {
    key: 'ronvang', name: 'MoMo', tax: '0109234871', city: 'Hà Nội',
    address: 'Hà Nội', verification: 'VERIFIED', daysAgo: 49,
    website: 'https://momo.vn',
    hr: 'Phạm Quốc Bảo',
    description: 'MoMo là ví điện tử và nền tảng thanh toán di động, cung cấp dịch vụ thanh toán, chuyển tiền và tài chính số cho người dùng Việt Nam.',
  },
  {
    key: 'canhdieu', name: 'Tiki', tax: '0313567890', city: 'TP. Hồ Chí Minh',
    address: 'TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 45,
    website: 'https://tiki.vn',
    hr: 'Võ Ngọc Mai',
    description: 'Tiki là nền tảng thương mại điện tử của Việt Nam, bán hàng chính hãng kèm dịch vụ giao hàng nhanh.',
  },
  {
    key: 'bienxanh', name: 'Rikkeisoft', tax: '0401234567', city: 'Đà Nẵng',
    address: 'Đà Nẵng', verification: 'VERIFIED', daysAgo: 41,
    website: 'https://rikkeisoft.com',
    hr: 'Đặng Thị Hồng Nhung',
    description: 'Rikkeisoft là công ty phần mềm Việt Nam, cung cấp dịch vụ phát triển phần mềm và nhân lực công nghệ, đặc biệt cho thị trường Nhật Bản.',
  },
  {
    key: 'anhduong', name: 'MISA', tax: '0110345672', city: 'Hà Nội',
    address: 'Hà Nội', verification: 'VERIFIED', daysAgo: 38,
    website: 'https://www.misa.vn',
    hr: 'Bùi Thanh Tâm',
    description: 'MISA là công ty phần mềm Việt Nam, cung cấp các giải pháp kế toán, quản trị doanh nghiệp và hóa đơn điện tử.',
  },
  {
    key: 'giodong', name: 'Giao Hàng Nhanh', tax: '0200987654', city: 'Hải Phòng',
    address: 'Hải Phòng', verification: 'VERIFIED', daysAgo: 34,
    website: 'https://ghn.vn',
    hr: 'Hoàng Văn Thắng',
    description: 'Giao Hàng Nhanh (GHN) là công ty vận chuyển và logistics thương mại điện tử của Việt Nam.',
  },
  {
    key: 'hongnac', name: 'Be Group', tax: '0315678904', city: 'TP. Hồ Chí Minh',
    address: 'TP. Hồ Chí Minh', verification: 'VERIFIED', daysAgo: 30,
    website: 'https://be.com.vn',
    hr: 'Ngô Khánh Linh',
    description: 'Be Group là công ty công nghệ phát triển ứng dụng gọi xe, giao đồ ăn và các dịch vụ tiện ích trên di động.',
  },
  {
    key: 'lachong', name: 'VNPT', tax: '1801234560', city: 'Cần Thơ',
    address: 'Cần Thơ', verification: 'VERIFIED', daysAgo: 27,
    website: 'https://vnpt.vn',
    hr: 'Lý Mỹ Duyên',
    description: 'VNPT là tập đoàn công nghệ - viễn thông của Việt Nam, cung cấp hạ tầng, nền tảng số và giải pháp công nghệ thông tin cho nhiều lĩnh vực, trong đó có y tế.',
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
