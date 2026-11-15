// Nén sẵn (brotli + gzip) các tệp JS / CSS / SVG trong client/dist/assets sau khi build giao diện.
// Máy chủ (src/utils/serveClient.js) gửi bản nén cho trình duyệt nên trang tải nhanh hơn nhiều mà không cần thư viện nén thêm.
// Chạy: node scripts/compress-client.js   (nằm trong lệnh build ở package.json thư mục gốc)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS = path.join(__dirname, '..', '..', 'client', 'dist', 'assets');
if (!fs.existsSync(ASSETS)) {
  console.error('❌ Không thấy client/dist/assets — hãy build client trước (npm run build ở thư mục client)');
  process.exit(1);
}

let files = 0; let before = 0; let after = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(js|css|svg|json|html)$/.test(e.name)) continue;
    const buf = fs.readFileSync(p);
    if (buf.length < 1024) continue;
    const br = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } });
    fs.writeFileSync(`${p}.br`, br);
    fs.writeFileSync(`${p}.gz`, zlib.gzipSync(buf, { level: 9 }));
    files += 1; before += buf.length; after += br.length;
  }
};
walk(ASSETS);
console.log(`✅ Đã nén sẵn ${files} tệp: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (brotli)`);
