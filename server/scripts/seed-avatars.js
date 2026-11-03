// Gắn ảnh đại diện (ảnh người thật làm dữ liệu minh họa) cho các ứng viên mẫu @demo.devhub.vn.
// Nguồn: https://randomuser.me/api/portraits — bộ ảnh chân dung dùng làm dữ liệu giả cho bản demo, có sẵn theo nam / nữ.
// Chạy: npm run db:seed-avatars   (chạy lại được: ảnh đã tải thì dùng lại, không tải thêm)
//  - Ảnh lưu ở uploads/images/demo-avatar-<handle>.jpg (như logo công ty mẫu) nên chạy offline vẫn hiển thị.
//  - Mỗi người một ảnh riêng; giới tính suy ra từ tên đệm / tên gọi theo bộ tên của dữ liệu mẫu.
//  - Chỉ đụng tới ứng viên mẫu; tài khoản thật (dev1, admin...) và nhà tuyển dụng (ảnh đại diện là logo công ty) giữ nguyên.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize } = require('../src/models');
const { NU } = require('./demo-data/people');

sequelize.options.logging = false;
const DIR = path.join(__dirname, '..', 'uploads', 'images');

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Danh sách 0..99 xáo trộn cố định: người thứ k của mỗi giới lấy ảnh thứ k → không trùng ảnh, kết quả giống nhau giữa các lần chạy
const shuffled = (seed) => {
  const a = Array.from({ length: 100 }, (_, i) => i); const r = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

(async () => {
  const rows = await sequelize.query(
    `SELECT u.id, u.full_name, split_part(u.email, '@', 1) AS handle
       FROM users u JOIN candidate_profiles cp ON cp.user_id = u.id
      WHERE u.email LIKE '%@demo.devhub.vn' ORDER BY u.email`,
    { type: 'SELECT' }
  );
  const order = { women: shuffled(11), men: shuffled(23) }; const used = { women: 0, men: 0 };
  fs.mkdirSync(DIR, { recursive: true });
  let downloaded = 0; let reused = 0; let failed = 0;
  for (const u of rows) {
    const given = u.full_name.trim().split(/\s+/).pop();
    const gender = NU.ten.includes(given) ? 'women' : 'men';
    const n = order[gender][used[gender]++ % 100];
    const file = `demo-avatar-${u.handle}.jpg`; const dest = path.join(DIR, file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) reused++;
    else {
      try {
        const res = await fetch(`https://randomuser.me/api/portraits/${gender}/${n}.jpg`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
        downloaded++;
      } catch (e) { failed++; console.warn(`⚠ ${u.full_name}: không tải được ảnh (${e.message})`); continue; }
    }
    const url = `/uploads/images/${file}`;
    await sequelize.query('UPDATE users SET avatar_url = :url WHERE id = :id', { replacements: { url, id: u.id } });
    await sequelize.query('UPDATE candidate_profiles SET avatar_url = :url WHERE user_id = :id', { replacements: { url, id: u.id } });
  }
  console.log(`✅ Ảnh đại diện cho ${rows.length - failed}/${rows.length} ứng viên mẫu (tải mới ${downloaded}, dùng lại ${reused}${failed ? `, lỗi ${failed}` : ''})`);
  await sequelize.close();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
