const fs = require('fs');
const path = require('path');
const express = require('express');

// Phục vụ bản build của giao diện (client/dist) từ chính máy chủ API để cả hai dùng chung MỘT tên miền:
// không lỗi CORS, cookie đăng nhập (SameSite=strict) hoạt động, đường dẫn /api và /uploads vẫn là đường dẫn tương đối.
// Chỉ bật khi deploy (NODE_ENV=production hoặc SERVE_CLIENT=true); lúc phát triển giao diện chạy riêng bằng Vite.
const DIST = path.join(__dirname, '..', '..', '..', 'client', 'dist');
const ASSETS = path.join(DIST, 'assets');
const ENCODINGS = [['br', '.br'], ['gzip', '.gz']]; // bản nén sẵn do scripts/compress-client.js tạo ra khi build

const shouldServe = () => process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true';

// Tệp trong /assets có tên băm theo nội dung → cache cả năm; ưu tiên bản nén sẵn (.br / .gz) nếu trình duyệt hỗ trợ
function assetsMiddleware(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  let file;
  try { file = path.join(ASSETS, decodeURIComponent(req.path)); } catch { return next(); }
  if (!file.startsWith(ASSETS + path.sep)) return next(); // chặn ../
  const accept = String(req.headers['accept-encoding'] || '');
  for (const [encoding, ext] of ENCODINGS) {
    if (accept.includes(encoding) && fs.existsSync(file + ext)) {
      res.type(path.extname(file));
      res.set({ 'Content-Encoding': encoding, Vary: 'Accept-Encoding', 'Cache-Control': 'public, max-age=31536000, immutable' });
      return res.sendFile(file + ext);
    }
  }
  return next();
}

// Gắn vào app SAU các route /api và /uploads, TRƯỚC bộ xử lý 404. Trả về true nếu đã gắn.
function mountClient(app) {
  const index = path.join(DIST, 'index.html');
  if (!shouldServe()) return false;
  if (!fs.existsSync(index)) {
    console.warn('⚠ Chưa có client/dist nên không phục vụ giao diện (hãy build client: npm run build ở thư mục gốc)');
    return false;
  }
  app.use('/assets', assetsMiddleware);
  app.use(express.static(DIST, {
    index: false,
    setHeaders: (res, file) => {
      if (file.startsWith(ASSETS + path.sep)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }));
  // Mọi đường dẫn còn lại của giao diện (/jobs, /admin/...) trả về index.html để React Router xử lý
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.set('Cache-Control', 'no-cache');
    return res.sendFile(index);
  });
  console.log('🖥️  Đang phục vụ giao diện từ client/dist');
  return true;
}

module.exports = { mountClient };
