// Chụp một bản thư mục uploads (ảnh mẫu, logo, CV mẫu có trong git) vào uploads-seed khi build để deploy lên Railway.
// Lý do: trên Railway uploads là Volume nên ban đầu trống; lúc khởi động server chép các file còn thiếu từ uploads-seed vào volume.
const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, '..', 'uploads');
const to = path.join(__dirname, '..', 'uploads-seed');
if (!fs.existsSync(from)) { console.log('Không có thư mục uploads, bỏ qua'); process.exit(0); }
fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });
console.log(`✅ Đã chụp uploads → uploads-seed (${fs.readdirSync(to).length} thư mục con)`);
