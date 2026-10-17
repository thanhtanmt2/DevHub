const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
const uploadDir = path.join(__dirname, '../../uploads/cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file định dạng .pdf, .doc, hoặc .docx'), false);
  }
};

const uploadCV = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter
});

const uploadImageDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadImageDir)) {
  fs.mkdirSync(uploadImageDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh (.jpg, .png, .gif, .webp)'), false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: imageFilter
});

// ─── File sản phẩm nộp cho task ───────────────────────────────────────────────
const uploadTaskDir = path.join(__dirname, '../../uploads/tasks');
if (!fs.existsSync(uploadTaskDir)) {
  fs.mkdirSync(uploadTaskDir, { recursive: true });
}

// Chỉ nhận tài liệu, ảnh, file nén... Không nhận .html/.svg/.js vì file được phục vụ công khai (tránh XSS)
const TASK_FILE_EXTENSIONS = [
  '.zip', '.rar', '.7z',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.csv',
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.sql', '.json', '.fig',
];

const taskFileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadTaskDir),
  filename: (req, file, cb) => {
    // Tên gốc (multer đọc theo latin1) → UTF-8 để giữ tiếng Việt khi hiển thị
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, path.extname(file.originalname))
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'file';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

const taskFileFilter = (req, file, cb) => {
  const ext = path.extname(Buffer.from(file.originalname, 'latin1').toString('utf8')).toLowerCase();
  if (TASK_FILE_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Định dạng file không được hỗ trợ. Chấp nhận: ${TASK_FILE_EXTENSIONS.join(', ')}`), false);
  }
};

const uploadTaskFile = multer({
  storage: taskFileStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: taskFileFilter
});

module.exports = { uploadCV, uploadImage, uploadTaskFile, TASK_FILE_EXTENSIONS };
