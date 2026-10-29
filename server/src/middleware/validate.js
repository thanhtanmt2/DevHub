const { validationResult } = require('express-validator');

// Tên hiển thị tiếng Việt của các trường, dùng khi quy tắc kiểm tra không tự ghi thông báo
const FIELD_LABELS = {
  email: 'Email', password: 'Mật khẩu', full_name: 'Họ và tên', token: 'Mã xác thực', otp: 'Mã OTP',
  name: 'Tên', title: 'Tiêu đề', description: 'Mô tả', content: 'Nội dung', address: 'Địa chỉ', tax_code: 'Mã số thuế',
  job_title: 'Chức danh', company_name: 'Tên công ty', start_date: 'Ngày bắt đầu', end_date: 'Ngày kết thúc',
  account_holder_name: 'Tên chủ tài khoản', bank_name: 'Ngân hàng', account_number: 'Số tài khoản',
  file_url: 'Đường dẫn file', file_name: 'Tên file', skill_id: 'Kỹ năng', job_post_id: 'Tin tuyển dụng',
  candidate_profile_id: 'Ứng viên', project_job_id: 'Vị trí dự án', workspace_member_id: 'Thành viên Workspace',
  status: 'Trạng thái', verification_status: 'Trạng thái xác thực', role: 'Vai trò', action: 'Hành động',
  score: 'Điểm', amount: 'Số tiền', interview_time: 'Thời gian phỏng vấn', meet_url: 'Link phỏng vấn',
};

// express-validator mặc định báo "Invalid value" (tiếng Anh) khi quy tắc không có withMessage
const toMessage = (e) => (
  !e.msg || e.msg === 'Invalid value'
    ? `${FIELD_LABELS[e.path] || e.path} không hợp lệ hoặc bị bỏ trống`
    : e.msg
);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const list = errors.array().map((e) => ({ field: e.path, message: toMessage(e) }));
    return res.status(422).json({
      success: false,
      // Giao diện chỉ hiện `message`, nên đưa lỗi đầu tiên lên đây để người dùng biết cần sửa gì
      message: list[0].message,
      errors: list,
    });
  }
  next();
};

module.exports = validate;
