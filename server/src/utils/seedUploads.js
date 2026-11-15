const fs = require('fs');
const path = require('path');

// Trên Railway thư mục uploads là một Volume (ổ lưu trữ riêng) nên ban đầu trống và che mất ảnh mẫu / logo có trong git.
// Khi build, scripts/prepare-uploads-seed.js chụp một bản thư mục uploads vào uploads-seed; mỗi lần khởi động ta chép
// những file còn thiếu từ bản đó vào volume (không ghi đè file đã có, không đụng tới file người dùng tải lên).
function seedUploads(seedDir = path.join(__dirname, '..', '..', 'uploads-seed'), targetDir = path.join(__dirname, '..', '..', 'uploads')) {
  if (!fs.existsSync(seedDir)) return 0;
  let copied = 0;
  const walk = (from, to) => {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const src = path.join(from, entry.name);
      const dest = path.join(to, entry.name);
      if (entry.isDirectory()) walk(src, dest);
      else if (!fs.existsSync(dest)) { fs.copyFileSync(src, dest); copied += 1; }
    }
  };
  walk(seedDir, targetDir);
  return copied;
}

module.exports = { seedUploads };
