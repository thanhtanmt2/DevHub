class AppError extends Error {
  // code (tùy chọn): mã lỗi để giao diện phân biệt trường hợp đặc biệt, vd EMAIL_NOT_VERIFIED
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
