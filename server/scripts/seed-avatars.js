// Gắn ảnh đại diện cho các ứng viên mẫu @demo.devhub.vn, giống ngoài đời: có người dùng ảnh chân dung, có người dùng hình khác, có người để mặc định.
// Chạy: npm run db:seed-avatars   (chạy lại được; mỗi lần chạy tải lại ảnh và gắn lại cho cả 40 người)
//
//  - ẢNH CHÂN DUNG: lấy từ bộ ảnh chân dung dùng làm dữ liệu giả của https://randomuser.me/api/portraits (có sẵn theo nam / nữ).
//    Bộ này đa số là người phương Tây nên chỉ dùng những ảnh trông giống người Việt / Đông Nam Á (đã chọn tay, xem PHOTOS bên dưới):
//    15 ảnh nữ, 4 ảnh nam (bỏ các ảnh trùng người). Ai không có ảnh chân dung thì rơi xuống hai nhóm dưới.
//  - HÌNH KHÁC: ảnh minh họa không phải người (nhân vật hoạt hình, họa tiết) từ https://api.dicebear.com (kiểu thumbs / shapes / rings, giấy phép CC0).
//  - MẶC ĐỊNH: không gắn ảnh, giao diện tự hiện chữ cái đầu của tên trên nền màu.
//  - Người đang tham gia nhiều dự án (hay xuất hiện trên màn hình) được ưu tiên có ảnh chân dung, rồi đến hình khác, còn lại để mặc định.
//  - Ảnh lưu ở uploads/images/demo-avatar-<handle>.jpg|png (như logo công ty mẫu) nên chạy offline vẫn hiển thị.
//  - Chỉ đụng tới ứng viên mẫu; tài khoản thật (dev1, admin...) và nhà tuyển dụng (ảnh đại diện là logo công ty) giữ nguyên.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize } = require('../src/models');
const { NU } = require('./demo-data/people');

sequelize.options.logging = false;
const DIR = path.join(__dirname, '..', 'uploads', 'images');

// Chỉ số ảnh trong randomuser.me/api/portraits/<women|men>/<n>.jpg trông giống người Việt / Đông Nam Á (chọn tay)
const PHOTOS = {
  women: [2, 12, 17, 27, 35, 42, 44, 48, 50, 60, 70, 78, 80, 85, 90], // 48 và 51 là cùng một người nên chỉ lấy 48
  men: [4, 26, 90, 92],
};
// Số người mỗi giới dùng "hình khác" (sau khi đã hết ảnh chân dung); phần còn lại để mặc định
const OTHER_COUNT = { women: 3, men: 6 };
const OTHER_STYLES = ['thumbs', 'shapes', 'thumbs', 'rings'];

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error('ảnh quá nhỏ');
  fs.writeFileSync(dest, buf);
}

(async () => {
  const rows = await sequelize.query(
    `SELECT u.id, u.full_name, split_part(u.email, '@', 1) AS handle, COUNT(wm.id) AS projects
       FROM users u
       JOIN candidate_profiles cp ON cp.user_id = u.id
       LEFT JOIN workspace_members wm ON wm.candidate_profile_id = cp.id AND wm.status <> 'REMOVED'
      WHERE u.email LIKE '%@demo.devhub.vn'
      GROUP BY u.id
      ORDER BY COUNT(wm.id) DESC, u.email`,
    { type: 'SELECT' }
  );
  fs.mkdirSync(DIR, { recursive: true });

  const used = { women: 0, men: 0 }; // đã chia bao nhiêu người của từng giới
  const keep = new Set();
  let photos = 0; let others = 0; let defaults = 0; let failed = 0;

  for (const u of rows) {
    const given = u.full_name.trim().split(/\s+/).pop();
    const gender = NU.ten.includes(given) ? 'women' : 'men';
    const k = used[gender]++;
    const nPhoto = PHOTOS[gender].length;
    let kind = k < nPhoto ? 'photo' : k < nPhoto + OTHER_COUNT[gender] ? 'other' : 'default';
    let file = null;

    try {
      if (kind === 'photo') {
        file = `demo-avatar-${u.handle}.jpg`;
        await download(`https://randomuser.me/api/portraits/${gender}/${PHOTOS[gender][k]}.jpg`, path.join(DIR, file));
        photos++;
      } else if (kind === 'other') {
        file = `demo-avatar-${u.handle}.png`;
        const style = OTHER_STYLES[(k - nPhoto) % OTHER_STYLES.length];
        await download(`https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(u.handle)}&size=256`, path.join(DIR, file));
        others++;
      }
    } catch (e) {
      console.warn(`⚠ ${u.full_name}: không tải được ảnh (${e.message}), để mặc định`);
      failed++; kind = 'default'; file = null;
    }

    if (file) keep.add(file); else defaults++;
    const url = file ? `/uploads/images/${file}` : null;
    await sequelize.query('UPDATE users SET avatar_url = :url WHERE id = :id', { replacements: { url, id: u.id } });
    await sequelize.query('UPDATE candidate_profiles SET avatar_url = :url WHERE user_id = :id', { replacements: { url, id: u.id } });
  }

  // Xóa ảnh đại diện mẫu cũ không còn được dùng (đổi kiểu ảnh hoặc chuyển sang mặc định)
  let removed = 0;
  for (const f of fs.readdirSync(DIR)) {
    if (/^demo-avatar-.+\.(jpg|png)$/.test(f) && !keep.has(f)) { fs.unlinkSync(path.join(DIR, f)); removed++; }
  }

  console.log(`✅ ${rows.length} ứng viên mẫu: ${photos} ảnh chân dung · ${others} hình khác · ${defaults} mặc định${failed ? ` (lỗi tải ${failed})` : ''}; đã xóa ${removed} ảnh cũ không còn dùng`);
  await sequelize.close();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
