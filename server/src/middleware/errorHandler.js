// Đổi lỗi của thư viện (Sequelize, multer, body-parser...) thành mã trạng thái + thông báo tiếng Việt dễ hiểu.
// Lỗi không lường trước thì không để lộ nội dung kỹ thuật (câu SQL, tên bảng...) ra cho người dùng.
const GENERIC_MESSAGE = 'Có lỗi xảy ra, vui lòng thử lại sau';

const normalizeError = (err) => {
  // Lỗi nghiệp vụ tự ném (AppError): giữ nguyên thông báo đã viết sẵn
  if (err.isOperational) return { status: err.statusCode || 500, message: err.message, code: err.code };

  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      return { status: 409, message: 'Dữ liệu này đã tồn tại, vui lòng kiểm tra lại' };
    case 'SequelizeValidationError':
      return { status: 400, message: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại các trường đã nhập' };
    case 'SequelizeForeignKeyConstraintError':
      return { status: 409, message: 'Thao tác không thực hiện được vì dữ liệu đang được sử dụng ở nơi khác' };
    case 'MulterError':
      return {
        status: 400,
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File vượt quá dung lượng cho phép' : 'Tải file lên không thành công',
      };
    default:
  }
  if (err.type === 'entity.parse.failed') return { status: 400, message: 'Dữ liệu gửi lên không đúng định dạng' };
  if (err.type === 'entity.too.large') return { status: 413, message: 'Dữ liệu gửi lên quá lớn' };

  // Còn lại là lỗi hệ thống: khi phát triển vẫn hiện nguyên nhân để dễ sửa, khi vận hành chỉ báo chung
  const status = err.status || err.statusCode || 500;
  return {
    status,
    message: process.env.NODE_ENV === 'development' && err.message ? err.message : GENERIC_MESSAGE,
  };
};

const errorHandler = (err, req, res, next) => {
  const { status, message, code } = normalizeError(err);
  console.error(`[ERROR] ${status} - ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(status).json({
    success: false,
    message,
    ...(code && { code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
