require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./src/models');
const errorHandler = require('./src/middleware/errorHandler');
const { startCronJobs, cleanupOrphanFiles } = require('./src/utils/cronJobs');
const { mountClient } = require('./src/utils/serveClient');
const { seedUploads } = require('./src/utils/seedUploads');

const app = express();
const PORT = process.env.PORT || 5000;

// Chạy sau proxy của Railway: lấy đúng địa chỉ IP và giao thức (https) của người dùng
app.set('trust proxy', 1);

// Middleware
// Khi máy chủ phục vụ luôn giao diện thì cần cho phép những nguồn mà giao diện dùng: đăng nhập Google, Google Fonts, ảnh https
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'", 'https://accounts.google.com'],
      'frame-src': ["'self'", 'https://accounts.google.com'],
      'connect-src': ["'self'", 'https://accounts.google.com'],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://accounts.google.com'],
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      'upgrade-insecure-requests': null, // đã chạy sau HTTPS của Railway; bỏ để thử bản production qua http://localhost
    },
  },
  // Cửa sổ đăng nhập Google cần postMessage về trang gốc
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev', {
  skip: (req, res) => req.url.includes('/api/notifications')
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DevHub API is running', timestamp: new Date().toISOString() });
});

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/upload', require('./src/routes/upload'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/candidates', require('./src/routes/candidates'));
app.use('/api/employer', require('./src/routes/employer'));
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/project-jobs', require('./src/routes/projectJobs'));
app.use('/api/applications', require('./src/routes/applications'));
app.use('/api/workspaces', require('./src/routes/workspaces'));
app.use('/api/tasks', require('./src/routes/tasks'));
app.use('/api/skills', require('./src/routes/skills'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/home', require('./src/routes/home'));
app.use('/api/forum', require('./src/routes/forum'));

// Giao diện (client/dist) khi deploy: phải gắn sau các route API và trước bộ xử lý 404
mountClient(app);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy đường dẫn' });
});

// Error handler
app.use(errorHandler);

// Start
const startServer = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      sequelize.options.logging = (msg) => {
        require('fs').appendFileSync(require('path').join(__dirname, 'sql_logs.txt'), msg + '\n');
      };
    }
    // In địa chỉ cơ sở dữ liệu đang dùng (không in mật khẩu) để dễ phát hiện khi deploy thiếu biến môi trường
    const { host, port, database } = sequelize.config;
    console.log(`🗄️  Đang kết nối cơ sở dữ liệu ${host}:${port}/${database}`);
    if (process.env.NODE_ENV === 'production' && ['localhost', '127.0.0.1', '::1'].includes(host)) {
      console.warn('⚠ Đang ở chế độ production nhưng cơ sở dữ liệu trỏ về localhost: kiểm tra biến DB_HOST / DATABASE_URL của dịch vụ');
    }
    await sequelize.authenticate();
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS interviewers (
        id UUID PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        title VARCHAR(150),
        default_meet_url VARCHAR(500),
        share_token VARCHAR(100) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE interviewers
        ADD COLUMN IF NOT EXISTS share_token VARCHAR(100) UNIQUE;
      ALTER TABLE project_applications
        ADD COLUMN IF NOT EXISTS interviewer_id UUID,
        ADD COLUMN IF NOT EXISTS interview_duration INTEGER DEFAULT 30,
        ADD COLUMN IF NOT EXISTS interviewer_name VARCHAR(150),
        ADD COLUMN IF NOT EXISTS interview_response VARCHAR(30) DEFAULT 'PENDING',
        ADD COLUMN IF NOT EXISTS candidate_reschedule_note TEXT,
        ADD COLUMN IF NOT EXISTS interview_responded_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS interview_result VARCHAR(30),
        ADD COLUMN IF NOT EXISTS interview_score DECIMAL(4,2),
        ADD COLUMN IF NOT EXISTS interview_criteria_scores JSONB,
        ADD COLUMN IF NOT EXISTS interview_feedback TEXT,
        ADD COLUMN IF NOT EXISTS interview_evaluated_at TIMESTAMP WITH TIME ZONE;
    `).catch((err) => console.warn('Schema check warning:', err.message));
    console.log('✅ Database connected');
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Models synced');
    }
    // Volume uploads trên Railway ban đầu trống: chép ảnh mẫu / logo từ bản chụp lúc build (chỉ file còn thiếu)
    try {
      const copied = seedUploads();
      if (copied) console.log(`📁 Đã chép ${copied} tệp mẫu vào thư mục uploads`);
    } catch (err) {
      console.warn('Không chép được tệp mẫu vào uploads:', err.message);
    }
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      // Khởi động hệ thống dọn rác ngầm
      startCronJobs();

      // (Tuỳ chọn) Chạy dọn dẹp ngay lần đầu bật server nếu muốn nghiệm thu
      setTimeout(() => cleanupOrphanFiles(), 5000); 
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
